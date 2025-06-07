export default class NotFoundPage {
  async render() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.body.setAttribute('data-page', 'not-found');
      });
    }

    return `
      <section class="not-found-container">
        <div class="not-found-content">
          <div class="not-found-icon">
            <i class="fas fa-map-signs"></i>
          </div>
          <h1 class="not-found-title">404 - Oopss!!! Halaman Tidak Ditemukan</h1>
          <a href="#/home" class="btn">Kembali ke Beranda</a>
          <a href="#/add" class="btn btn-outline">Bagikan Cerita</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const elements = document.querySelectorAll('.not-found-icon, .not-found-title, .btn');

    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-in');
      }, 150 * index);
    });
  }
}
