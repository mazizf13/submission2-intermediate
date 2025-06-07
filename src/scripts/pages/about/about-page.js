export default class AboutPage {
  async render() {
    return `
      <section class="about-page slide-in">
        <div class="about-content">
          <h1>Tentang Aplikasi Ini</h1>
          <p>Selamat! Anda telah menyelesaikan setengah perjalanan di kelas ini. Sejauh ini, Anda telah belajar hal-hal berikut.</p>
          <ul>
            <li>Merancang aksesibilitas yang sesuai dengan standar Web Content Accessibility Guidelines (WCAG).</li>
            <li>Merancang transisi halaman yang halus dan sesuai dengan konteks pengguna.</li>
            <li>Mengembangkan akses hardware terkait media, seperti kamera dan mikrofon.</li>
            <li>Merancang aplikasi peta digital yang memanfaatkan perangkat global positioning system (GPS)</li>
          </ul>
          <p>Semua materi di atas menjadi bekal untuk para web developer yang sedang menciptakan aplikasi web dengan kombinasi berbagai Web API yang proporsional. Masih ada beberapa materi ke depan untuk dipelajari yang sedang menunggu Anda. Sebelum itu, kami perlu menguji pengetahuan-pengetahuan Anda melalui asesmen dengan membangun sebuah aplikasi web. Nantinya, reviewer kami akan memeriksa pekerjaan Anda dan memberikan hasil reviu pada proyek yang dibuat.</p>
          <p>Submission ini menugaskan Anda membuat aplikasi dengan pilihan tema dari kami: berbagi cerita, jualan online, dan katalog film. Tugas tersebut menjadi salah satu syarat untuk lulus dari kelas ini. Kami mengedepankan kreativitas Anda dalam membangun aplikasi, tetapi pastikan aplikasi yang dibuat memenuhi kriteria yang akan dijelaskan berikut.</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const section = document.querySelector('.about-page');
    if (!section) return;

    section.animate(
      [
        { opacity: 0, transform: 'translateX(100px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      {
        duration: 600,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );
  }
}
