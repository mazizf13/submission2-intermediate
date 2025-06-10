import { openDB } from 'idb';

const DATABASE_NAME = 'd-story-db';
const DATABASE_VERSION = 1;
const STORIES_STORE = 'stories';
const FAVORITES_STORE = 'favorites';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORIES_STORE)) {
      database.createObjectStore(STORIES_STORE, { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains(FAVORITES_STORE)) {
      database.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
    }
  },
});

const IdbSource = {
  // OFFLINE STORIES
  async getStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  },

  async getStoryById(id) {
    return (await dbPromise).get(STORIES_STORE, id);
  },

  async saveStory(story) {
    return (await dbPromise).put(STORIES_STORE, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(STORIES_STORE, id);
  },

  async searchStories(query) {
    const stories = await this.getStories();
    return stories.filter((story) => {
      const searchableText = `${story.name} ${story.description}`.toLowerCase();
      return searchableText.includes(query.toLowerCase());
    });
  },

  // FAVORITE STORIES
  async getFavoriteStories() {
    return (await dbPromise).getAll(FAVORITES_STORE);
  },

  async addFavoriteStory(story) {
    return (await dbPromise).put(FAVORITES_STORE, story);
  },

  async removeFavoriteStory(id) {
    return (await dbPromise).delete(FAVORITES_STORE, id);
  },

  async isStoryFavorite(id) {
    const result = await (await dbPromise).get(FAVORITES_STORE, id);
    return !!result;
  },
};

export default IdbSource;
