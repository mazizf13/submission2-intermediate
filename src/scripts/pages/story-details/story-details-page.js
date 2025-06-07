import {
  generateStoryDetailsErrorTemplate,
  generateStoryDetailsTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
  generateLoaderAbsoluteTemplate,
} from '../../templates';

import StoryDetailsPresenter from './story-details-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as StoryAPI from '../../data/api';
import IdbSource from '../../data/idb-source';

export default class StoryDetailsPage {
  constructor() {
    this.presenter = null;
    this.map = null;
  }

  async render() {
    return `
      <section class="story-details-container">
        <div class="container">
          <a href="#/home" class="back-button" aria-label="Back to stories list">
            <i class="fas fa-arrow-left"></i> Back to Stories
          </a>
        </div>
        <div id="story-details" class="story-details"></div>
        <div id="story-details-loading-container" class="story-details-loading"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = parseActivePathname().id;

    if (!storyId) {
      this.populateStoryDetailsError('Story ID not found');
      return;
    }

    this.presenter = new StoryDetailsPresenter(storyId, {
      view: this,
      apiModel: StoryAPI,
    });

    this.presenter.showStoryDetails();
  }

  async populateStoryDetailsAndInitialMap(message, story) {
    try {
      if (!story) throw new Error('Story data is missing');

      const location = story.location || {
        lat: 0,
        lon: 0,
        placeName: 'Unknown location',
      };
      const lat = location.lat ?? 0;
      const lon = location.lon ?? 0;

      document.getElementById('story-details').innerHTML = generateStoryDetailsTemplate({
        name: story.name || 'Unknown',
        description: story.description || 'No description available',
        photoUrl: story.photoUrl,
        location: { ...location, lat, lon },
        createdAt: story.createdAt || new Date().toISOString(),
      });

      await this.initialMap();

      if (this.map) {
        const coordinates = [lat, lon];

        if ((lat !== 0 || lon !== 0) && !isNaN(lat) && !isNaN(lon)) {
          const name = story.name || 'Unknown';
          this.map.changeCamera(coordinates, 15);
          this.map.addMarker(
            coordinates,
            {
              alt: `${name}'s story location`,
            },
            {
              content: `${name}'s story was shared from here`,
            },
          );
        } else {
          console.warn('Invalid location. Skipping marker.');
        }
      }

      this.presenter.showSaveButton();
      this.addShareEventListener();

      await this.renderOfflineSaveButton(story);
    } catch (error) {
      this.populateStoryDetailsError('Error displaying story details. Please try again.');
    }
  }

  populateStoryDetailsError(message) {
    document.getElementById('story-details').innerHTML = generateStoryDetailsErrorTemplate(message);
  }

  async initialMap() {
    const mapElement = document.getElementById('map');

    if (!mapElement) {
      return;
    }

    mapElement.style.backgroundColor = '#f0f0f0';

    try {
      this.map = await Map.build('#map', { zoom: 15 });

      if (!this.map) {
        mapElement.innerHTML = `
          <div class="map-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Unable to load map. Please check your internet connection.</p>
          </div>
        `;
      }
    } catch (error) {
      mapElement.innerHTML = `
        <div class="map-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to load map. Please check your internet connection.</p>
        </div>
      `;
    }
  }

  async renderOfflineSaveButton(story) {
    const storyId = this.presenter.getStoryId();
    const savedStory = await IdbSource.getStoryById(storyId);

    const saveOfflineBtn = document.createElement('button');
    saveOfflineBtn.id = 'save-offline-button';
    saveOfflineBtn.className = 'btn btn-outline';
    saveOfflineBtn.innerHTML = savedStory
      ? '<i class="fas fa-check"></i> Tersimpan Offline'
      : '<i class="fas fa-download"></i> Simpan Offline';
    saveOfflineBtn.disabled = !!savedStory;

    saveOfflineBtn.addEventListener('click', async () => {
      try {
        await IdbSource.saveStory({
          id: storyId,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: story.location,
        });

        saveOfflineBtn.disabled = true;
        saveOfflineBtn.innerHTML = '<i class="fas fa-check"></i> Tersimpan Offline';
        alert('Cerita berhasil disimpan untuk dibaca offline!');
      } catch (error) {
        alert('Gagal menyimpan cerita. Silakan coba lagi.');
      }
    });

    const actionsContainer = document.querySelector('.story-details__actions');
    if (actionsContainer) {
      actionsContainer.appendChild(saveOfflineBtn);
    }
  }

  renderSaveButton() {
    const saveContainer = document.getElementById('save-actions-container');

    if (!saveContainer) return;

    saveContainer.innerHTML = generateSaveStoryButtonTemplate();

    document.getElementById('story-details-save')?.addEventListener('click', async () => {
      const storyId = parseActivePathname().id;

      const response = await this.presenter.toggleFavorite({
        id: storyId,
        name: document.querySelector('.story-details-title')?.textContent,
        description: document.querySelector('.story-details__description')?.textContent,
        photoUrl: document.querySelector('.story-details__image')?.src,
        createdAt: new Date().toISOString(),
        location: {
          lat: document
            .querySelector('.story-details__location-coordinates')
            ?.textContent.split('Latitude: ')[1]
            ?.split('\n')[0],
          lon: document
            .querySelector('.story-details__location-coordinates')
            ?.textContent.split('Longitude: ')[1],
        },
      });

      if (response) alert('Story Favorited Successfully!');
    });
  }

  renderRemoveButton() {
    const saveContainer = document.getElementById('save-actions-container');

    if (!saveContainer) return;

    saveContainer.innerHTML = generateRemoveStoryButtonTemplate();

    document.getElementById('story-details-remove')?.addEventListener('click', async () => {
      const response = await this.presenter.toggleFavorite();
      if (!response) alert('Story Removed from Favorites!');
    });
  }

  addShareEventListener() {
    const shareButton = document.getElementById('story-details-share');

    if (!shareButton) return;

    shareButton.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Check out this story on D`story',
          text: 'I found an interesting story on D`story!',
          url: window.location.href,
        });
      } else {
        alert('Sharing is not supported in your browser. Copy the URL to share manually.');
      }
    });
  }

  showStoryDetailsLoading() {
    const container = document.getElementById('story-details-loading-container');
    if (container) container.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailsLoading() {
    const container = document.getElementById('story-details-loading-container');
    if (container) container.innerHTML = '';
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container');
    if (container) container.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    const container = document.getElementById('map-loading-container');
    if (container) container.innerHTML = '';
  }
}
