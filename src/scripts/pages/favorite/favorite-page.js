import { generateStoryItemTemplate } from '../../templates';
import IdbSource from '../../data/idb-source';

export default class FavoritePage {
  async render() {
    return `
      <section class="container">
        <div class="favorite-container">
          <h1 class="section-title">Favorite Stories</h1> 

          <div class="favorite-tabs">
            <button id="online-tab" class="favorite-tab active">Online Favorites</button> 
            <button id="offline-tab" class="favorite-tab">Offline Stories</button>
          </div>

          <div id="favorite-stories-container" class="favorite-content"> 
            <!-- Stories will be loaded here -->
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.loadFavoriteStories();
    this.setupTabs();
  }

  setupTabs() {
    const onlineTab = document.getElementById('online-tab');
    const offlineTab = document.getElementById('offline-tab');

    onlineTab.addEventListener('click', () => {
      onlineTab.classList.add('active');
      offlineTab.classList.remove('active');
      this.loadFavoriteStories();
    });

    offlineTab.addEventListener('click', () => {
      offlineTab.classList.add('active');
      onlineTab.classList.remove('active');
      this.loadOfflineStories();
    });
  }

  async loadOfflineStories() {
    const container = document.getElementById('favorite-stories-container');

    try {
      const stories = await IdbSource.getStories();

      if (!stories || stories.length === 0) {
        container.innerHTML = `
          <div class="favorite-message"> 
            <i class="fas fa-database favorite-icon"></i> 
            <h2>No Offline Stories</h2>
            <p>No offline stories yet. Go to a story page and tap "Simpan Offline" to get started!</p>
            <a href="#/home" class="btn">Browse Stories</a>
          </div>
        `;
        return;
      }

      const html = stories.reduce((accumulator, story) => {
        return accumulator.concat(
          generateStoryItemTemplate({
            ...story,
            name: story.name,
          }),
        );
      }, '');

      container.innerHTML = `
        <div class="stories-list">${html}</div>
      `;

      const storyItems = container.querySelectorAll('.story-item');
      storyItems.forEach((item) => {
        const storyId = item.dataset.storyid;
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline delete-offline-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Remove Offline';
        deleteButton.addEventListener('click', async () => {
          if (confirm('Are you sure you want to remove this story from offline storage?')) {
            await IdbSource.deleteStory(storyId);
            this.loadOfflineStories();
          }
        });
        item.querySelector('.story-item__body').appendChild(deleteButton);
      });
    } catch (error) {
      console.error('Error loading offline stories:', error);
      container.innerHTML = `
        <div class="favorite-message"> 
          <i class="fas fa-exclamation-triangle favorite-icon"></i> 
          <h2>Failed to Load Offline Stories</h2>
          <p>There was an error loading offline stories. Please try again later.</p>
          <button class="btn" onclick="location.reload()">Try Again</button>
        </div>
      `;
    }
  }

  async loadFavoriteStories() {
    const container = document.getElementById('favorite-stories-container');

    try {
      const favoriteStories = await IdbSource.getFavoriteStories();

      if (!favoriteStories || favoriteStories.length === 0) {
        container.innerHTML = `
          <div class="favorite-message"> 
            <h2>No Favorite Stories</h2>
            <p>You haven't favorite any stories yet. Browse stories and click the favorite button to save them for later.</p>
            <a href="#/home" class="btn">Browse Stories</a>
          </div>
        `;
        return;
      }

      const html = favoriteStories.reduce((accumulator, story) => {
        return accumulator.concat(
          generateStoryItemTemplate({
            ...story,
            name: story.name,
          }),
        );
      }, '');

      container.innerHTML = `
        <div class="stories-list">${html}</div>
      `;

      const storyItems = container.querySelectorAll('.story-item');
      storyItems.forEach((item) => {
        const storyId = item.dataset.storyid;
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline delete-favorite-btn';
        deleteButton.innerHTML = '<i class="fas fa-heart"></i> Remove Favorite';
        deleteButton.addEventListener('click', async () => {
          if (confirm('Are you sure you want to remove this favorite?')) {
            await IdbSource.removeFavoriteStory(storyId);
            this.loadFavoriteStories();
          }
        });
        item.querySelector('.story-item__body').appendChild(deleteButton);
      });
    } catch (error) {
      console.error('Error loading favorite stories:', error);
      container.innerHTML = `
        <div class="favorite-message"> 
          <i class="fas fa-exclamation-triangle favorite-icon"></i> 
          <h2>Failed to Load Favorite Stories</h2>
          <p>There was an error loading favorite stories. Please try again later.</p>
          <button class="btn" onclick="location.reload()">Try Again</button>
        </div>
      `;
    }
  }
}
