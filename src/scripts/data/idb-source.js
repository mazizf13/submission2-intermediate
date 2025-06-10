import { openDB } from 'idb';

const DATABASE_NAME = 'd-story-db';
const DATABASE_VERSION = 1;
const STORIES_STORE = 'stories';
const FAVORITES_STORE = 'favorites';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database, oldVersion, newVersion) {
    console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);

    if (!database.objectStoreNames.contains(STORIES_STORE)) {
      database.createObjectStore(STORIES_STORE, { keyPath: 'id' });
    }

    if (!database.objectStoreNames.contains(FAVORITES_STORE)) {
      database.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
    }
  },
});

const IdbSource = {
  async getStories() {
    try {
      const db = await dbPromise;
      return db.getAll(STORIES_STORE);
    } catch (error) {
      console.error('Failed to get stories:', error);
      return [];
    }
  },

  async getStoryById(id) {
    try {
      const db = await dbPromise;
      return db.get(STORIES_STORE, id);
    } catch (error) {
      console.error('Failed to get story by ID:', error);
      return null;
    }
  },

  async saveStory(story) {
    try {
      const db = await dbPromise;
      return db.put(STORIES_STORE, story);
    } catch (error) {
      console.error('Failed to save story:', error);
    }
  },

  async deleteStory(id) {
    try {
      const db = await dbPromise;
      return db.delete(STORIES_STORE, id);
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  },

  async searchStories(query) {
    try {
      const stories = await this.getStories();
      return stories.filter((story) => {
        const searchableText = `${story.name} ${story.description}`.toLowerCase();
        return searchableText.includes(query.toLowerCase());
      });
    } catch (error) {
      console.error('Failed to search stories:', error);
      return [];
    }
  },

  async getFavoriteStories() {
    try {
      const db = await dbPromise;
      return db.getAll(FAVORITES_STORE);
    } catch (error) {
      console.error('Failed to get favorite stories:', error);
      return [];
    }
  },

  async addFavoriteStory(story) {
    try {
      const db = await dbPromise;
      return db.put(FAVORITES_STORE, story);
    } catch (error) {
      console.error('Failed to add favorite story:', error);
    }
  },

  async removeFavoriteStory(id) {
    try {
      const db = await dbPromise;
      return db.delete(FAVORITES_STORE, id);
    } catch (error) {
      console.error('Failed to remove favorite story:', error);
    }
  },

  async isStoryFavorite(id) {
    try {
      const db = await dbPromise;
      const result = await db.get(FAVORITES_STORE, id);
      return !!result;
    } catch (error) {
      console.error('Failed to check if story is favorite:', error);
      return false;
    }
  },
};

export default IdbSource;
