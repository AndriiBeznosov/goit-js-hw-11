import { Notify } from 'notiflix';
import NewsApiService from './new-service';
// Notify.success('Sol lucet omnibus');

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};
const newsApiService = new NewsApiService();

refs.form.addEventListener('submit', searchImage);
refs.btnLoadMore.addEventListener('click', onLoadMore);

function searchImage(e) {
  e.preventDefault();

  if (!e.currentTarget.elements.searchQuery.value) {
    return;
  }
  refs.gallery.innerHTML = '';
  newsApiService.query = e.currentTarget.elements.searchQuery.value;
  newsApiService.resetPage();
  newsApiService.onTotalPageReset();
  refs.btnLoadMore.disabled = false;

  newsApiService.searchGelleryPhoto().then(res => {
    if (res.data.hits.length === 0) {
      return Notify.failure(
        `"Sorry, there are no images matching your search query. Please try again."`
      );
    }

    Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
    galleryRender(res.data.hits);
    refs.btnLoadMore.classList.remove('is-hidden');
    newsApiService.onTotalPage();
  });
  // .catch();
}

function onLoadMore() {
  newsApiService.incrementPage();
  newsApiService.searchGelleryPhoto().then(res => {
    if (res.data.totalHits <= newsApiService.totalPage) {
      refs.btnLoadMore.disabled = true;
      return Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
    console.log(res.data);
    console.log(newsApiService.totalPage);
    console.log(res.data.totalHits);

    newsApiService.onTotalPage();
    galleryRender(res.data.hits);
  });
  //   .catch(error => {
  //     console.log(error);
  //   });;
}

function galleryRender(photos) {
  const gallery = photos
    .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
      //   console.log(e.target.elements.searchQuery.value);
      return `
    <div class="photo-card">
  <img src=${webformatURL} alt="${tags}" loading="lazy" class='img-card'/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
     ${downloads}
    </p>
  </div>
</div>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', gallery);
}

//<button type="button" class="load-more">Load more</button>`;
