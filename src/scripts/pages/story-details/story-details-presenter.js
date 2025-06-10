/* eslint-disable no-undef */
import { storyMapper } from '../../data/api-mapper';
import IdbSource from '../../data/idb-source';

export default class StoryDetailsPresenter {
  #storyId;
  #view;
  #apiModel;

  constructor(storyId, { view, apiModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showStoryDetailsMap() {
    this.#view.showMapLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        throw new Error(response.message || 'Failed to fetch story for map');
      }

      const storyData = response.story;

      if (!storyData || (!storyData.location && storyData.lat == null && storyData.lon == null)) {
        throw new Error('No location data available for the story');
      }

      const location = storyData.location || {
        lat: storyData.lat,
        lon: storyData.lon,
      };

      this.#view.renderMap(location.lat, location.lon);
    } catch (error) {
      this.#view.renderMapError(error.message || 'Error loading map');
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetails() {
    this.#view.showStoryDetailsLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        this.#view.populateStoryDetailsError(response.message);
        return;
      }

      if (!response.story) {
        throw new Error('Story data not found');
      }

      const storyData = { ...response.story };

      if (!storyData.location && (storyData.lat !== undefined || storyData.lon !== undefined)) {
        console.log('Creating location object from direct lat/lon properties');
        storyData.location = {
          lat: storyData.lat,
          lon: storyData.lon,
        };
      } else if (!storyData.location) {
        storyData.location = { lat: 0, lon: 0 };
      } else {
        console.log('Story location from API:', storyData.location);
      }

      const story = await storyMapper(storyData);

      this.#view.populateStoryDetailsAndInitialMap(response.message, story);
    } catch (error) {
      this.#view.populateStoryDetailsError(error.message || 'Error loading story details');
    } finally {
      this.#view.hideStoryDetailsLoading();
    }
  }

  async getCommentsList() {
    this.#view.showCommentsLoading();
    try {
      const response = await this.#apiModel.getAllCommentsByStoryId(this.#storyId);
      this.#view.populateStoryDetailsComments(response.message, response.comments || []);
    } catch (error) {
      this.#view.populateCommentsListError(error.message);
    } finally {
      this.#view.hideCommentsLoading();
    }
  }

  async postNewComment({ body }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#apiModel.storeNewCommentByStoryId(this.#storyId, { body });

      if (!response.ok) {
        this.#view.postNewCommentFailed(response.message);
        return;
      }

      this.#view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      this.#view.postNewCommentFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async showSaveButton() {
    const isSaved = await this.#isStorySaved();
    if (isSaved) {
      this.#view.renderRemoveButton();
    } else {
      this.#view.renderSaveButton();
    }
  }

  async #isStorySaved() {
    return await IdbSource.isStoryFavorite(this.#storyId);
  }

  async toggleFavorite(story) {
    const isFavorite = await IdbSource.isStoryFavorite(this.#storyId);

    if (isFavorite) {
      await IdbSource.removeFavoriteStory(this.#storyId);
      this.#view.renderSaveButton();
      return false;
    } else {
      await IdbSource.addFavoriteStory(story);
      this.#view.renderRemoveButton();
      return true;
    }
  }

  getStoryId() {
    return this.#storyId;
  }
}
