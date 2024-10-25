import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import assert from "assert";
import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";
import { getModelForCategory, getModelForLabelPairs } from "./utils";
// the is proof of concept
// Note: wanted to get rid of categories at some point, but then if user searches for
// a label would not know what opposite of it as easily/accurately though certainly
// something that could be researched more

// Right now only deal with constrained set of categories for simplicity
// therefore have assertions that should/could be removed in the future
export interface CategoryDoc extends BaseDoc {
  category: string;
  labels: ObjectId[];
}

export interface LabelDoc extends BaseDoc {
  label: string;
  items: ObjectId[];
}

/**
 * concept: Labeling [Item, Categories]
 */
export default class LabelingConcept {
  public readonly categories: DocCollection<CategoryDoc>;
  public readonly labels: DocCollection<LabelDoc>;
  private readonly allowedCategories: string[];

  /**
   * Make an instance of Labeling.
   */
  constructor(collectionName: string, allowedCategories: string[]) {
    this.labels = new DocCollection<LabelDoc>(collectionName + "Labels");
    this.categories = new DocCollection<CategoryDoc>(collectionName + "Categories");
    this.allowedCategories = allowedCategories.concat(["all"]);
  }

  /**
   * Update the labels with items they label
   * @param item item in the app
   * @param labels labels for the item
   * @returns successful message
   */
  async addLabelsForItem(item: ObjectId, labels: string[]) {
    // find category
    const category = await this.findCategoryGemini(labels);
    // add all items with corresponding labels
    const labelIds = await this.addItemToLabels(labels, item);
    // add labels to category
    await this.addLabelsForCategory(category, labelIds);
    return { msg: `Labels ${labels} successfully added into category ${category}!` };
  }

  async getLabelsForItem(item: ObjectId): Promise<string[]> {
    return (await this.labels.readMany({ items: item })).map((labelDoc) => labelDoc.label);
  }

  async updateLabelsForItem(item: ObjectId, labels: string[]) {
    const current_labels = await this.getLabelsForItem(item);
    const add_labels = labels.filter((label) => !current_labels.includes(label));
    const remove_labels = current_labels.filter((label) => !labels.includes(label));
    await this.addLabelsForItem(item, add_labels);
    await this.removeItemFromLabel(item, { label: { $in: remove_labels } });
    return { msg: `Labels ${labels} successfully updated!` };
  }

  /**
   * remove labels from items and respective categories if there are no other items
   * @param item labeled item
   * @param labels valid filter for labels to remove `item` from
   */
  async removeItemFromLabel(item: ObjectId, labels: { label: { $in: string[] } } | object = {}) {
    const update = await this.labels.updateMany(labels, { $pull: { items: item } });
    const labelDocs = await this.labels.readMany({ items: { $size: 0 } });
    console.log("labeldocs with no items", labelDocs, update);
    for (const label of labelDocs) {
      await this.categories.updateMany({}, { $pull: { labels: label._id } });
      await this.categories.deleteMany({ labels: { $size: 0 } });
    }
    await this.labels.deleteMany({ items: { $size: 0 } });
    return { msg: `Deleted item ${item}` };
  }

  /**
   * Get pairings of content in the given category with opposing content
   * @param category general category
   * @returns pairings of content in the category
   */
  async getOpposingItems(category: string): Promise<ObjectId[][]> {
    const oppositeItems: ObjectId[][] = [];

    const closestCategory = await this.getClosestExistingCategory(category);
    assert(this.allowedCategories.includes(closestCategory), `expected one of ${this.allowedCategories} but got category ${category}`);
    // All labels in the category
    const labels = await this.getLabelsInCategory(closestCategory);
    // try multiple times just in case
    for (let tryNumber = 0; tryNumber < 3; tryNumber++) {
      console.log("try number: ", tryNumber);
      if (oppositeItems.length === 0) {
        // Match opposites
        const oppositeLabels = await this.getOppositeLabelPairs(labels, category);
        // Match items with opposite labels
        for (const [l1, l2] of oppositeLabels) {
          const items_l1 = await this.getItemsWithLabel(l1);
          const items_l2 = await this.getItemsWithLabel(l2);
          // TODO: somehow get unique
          for (let i = 0; i < Math.min(items_l1.length, items_l2.length); i++) {
            if (items_l1[i].toString() !== items_l2[i].toString()) {
              oppositeItems.push([items_l1[i], items_l2[i]]);
            }
          }
        }
      }
    }

    return oppositeItems;
  }

  /**
   * Get all possible categories
   * @returns get all categories we have content in so far
   */
  async getAllCategories(): Promise<string[]> {
    return (await this.categories.readMany({})).map((categoryDoc) => categoryDoc.category);
  }

  // TODO have a helper function that does both?
  /**
   * Get all items with given tag
   * @param tag a label
   * @returns all item ids with that label
   * @throws error if there are no items with a given tag
   */

  async getItemsWithLabel(label: string): Promise<ObjectId[]> {
    const labelDocs = await this.labels.readMany({ label });
    if (labelDocs.length === 0) {
      throw new NotFoundError(`No items have label ${label}!`);
    } else if (labelDocs.length === 1) {
      return labelDocs[0].items;
    }
    const items = labelDocs.reduce((accumulator, curLabelDoc) => {
      return accumulator.concat(curLabelDoc.items);
    }, labelDocs[0].items);
    return items;
  }

  /**
   * Get all labels within a field
   * @param category any
   * @returns all item ids within the category
   * @throws error if there are no labels in a given category, or category is not allowed
   */
  private async getLabelsInCategory(category: string): Promise<ObjectId[]> {
    assert(this.allowedCategories.includes(category), `expected one of ${this.allowedCategories} but got category ${category}`);
    const categoryDocs = await this.categories.readMany({ category: category });
    if (categoryDocs.length === 0) {
      throw new NotFoundError(`No items are in category ${category}!`);
    } else if (categoryDocs.length === 1) {
      return categoryDocs[0].labels;
    }
    const labels = categoryDocs.reduce((accumulator, curCategoryDoc) => {
      return accumulator.concat(curCategoryDoc.labels);
    }, categoryDocs[0].labels);
    return labels;
  }

  /**
   * Tag item with labels
   * @param labels tags for an item
   * @param item any
   * @returns returns ids of the labels stored
   */
  private async addItemToLabels(labels: string[], item: ObjectId): Promise<ObjectId[]> {
    const labelIds: ObjectId[] = [];
    for (const label of labels) {
      const labelDoc = await this.labels.readOne({ label });
      if (labelDoc === null) {
        labelIds.push(await this.labels.createOne({ label, items: [item] }));
      } else {
        labelIds.push(labelDoc._id);
        await this.labels.updateMany({ label }, { $addToSet: { items: item } });
      }
    }
    return labelIds;
  }

  /**
   * Add tags to category
   * @param category any
   * @param labelIds ids for the tags
   */
  private async addLabelsForCategory(category: string, labelIds: ObjectId[]) {
    assert(this.allowedCategories.includes(category), `expected one of ${this.allowedCategories} but got ${category}`);
    const categoryDoc = await this.categories.readOne({ category });
    if (categoryDoc === null) {
      await this.categories.createOne({ category, labels: labelIds });
    } else {
      const allLabelIds = categoryDoc.labels.concat(labelIds);
      const uniqueLabels = this.findUniqueIds(allLabelIds);
      await this.categories.updateMany({ category }, { $addToSet: { labels: { $each: uniqueLabels } } });
    }
  }

  /**
   * Get general category labels belong to
   * @param labels tags
   * @returns One of the general categories the labels belong to
   */
  private async findCategoryGemini(labels: string[]): Promise<string> {
    const model = getModelForCategory(this.allowedCategories);
    const result = await model.generateContent(`
      Here are the labels: \`\`\`${labels}\`\`\``);
    console.log("STATUS CODE:", result.response.promptFeedback);
    try {
      const category = JSON.parse(result.response.text());
      if (category in this.allowedCategories) {
        return category;
      } else {
        return "all";
      }
    } catch (e) {
      if (e instanceof GoogleGenerativeAIFetchError) {
        if (e.status === 429) {
          console.log("token limit reached!");
          return "";
        }
      }
      throw e;
    }
  }

  /**
   * Get unique array of mongodb objectIds
   * @param ids some mongodb objectids
   * @returns unique objectIds
   */
  private findUniqueIds(ids: ObjectId[]): ObjectId[] {
    return [...new Set(ids.map((id) => id.toString()))].map((idstring) => new ObjectId(idstring));
  }

  private async getLabelsValues(labels: ObjectId[]): Promise<string[]> {
    return (await this.labels.readMany({ _id: { $in: labels } })).map((labelDoc) => labelDoc.label);
  }

  private async getOppositeLabelPairs(labels: ObjectId[], category: string): Promise<string[][]> {
    const labelVaues = await this.getLabelsValues(labels);
    const model = getModelForLabelPairs();
    const prompt = `
      Given a list of labels enclosed in \`\`\` in category ${category}, 
      pair the labels l_1 and l_2 together 
      iff l_1 and l_2 have opposing meaning in category ${category}. 
       Decide on the pairing and return an array of tuples of labels. Here are the labels \`\`\`${labelVaues}\`\`\``;
    console.log("prompt for google: ", prompt);
    try {
      const result = await model.generateContent(prompt);
      console.log("result from google: ", result.response.text());
      return JSON.parse(result.response.text());
    } catch (e) {
      console.log("the error: ", e);
      return [[]];
    }

    // for (const cand of result.response.candidates ?? []) {
    //   for (const rating of cand.safetyRatings ?? []) {
    //     console.log("ratings: ", rating);
    //   }
    // }
  }

  // Future work
  private async getClosestExistingCategory(category: string): Promise<string> {
    // TODO would be useful in future
    return category;
  }
}
