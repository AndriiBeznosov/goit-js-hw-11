import { Notify } from 'notiflix';
import NewsApiService from './new-service';
import debounce from 'lodash.debounce';
import LoadMoreBtn from './load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
// import './css/commons.css';

const DEBOUNCE_DELAY = 300;
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnSearch: document.querySelector('.btn-search'),
  input: document.querySelector('.input'),
};
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});
const newsApiService = new NewsApiService();
console.log(loadMoreBtn);

refs.form.addEventListener('submit', searchImage);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);
refs.input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput() {
  refs.btnSearch.disabled = false;
}

function searchImage(e) {
  e.preventDefault();

  newsApiService.query = e.currentTarget.elements.searchQuery.value;
  if (!e.currentTarget.elements.searchQuery.value.trim()) {
    setTimeout(() => {
      refs.form.reset();
    }, 500);
    return Notify.info('Empty string, enter your request');
  }
  loadMoreBtn.show();
  newsApiService.resetPage();
  fetchArticals();
  refs.btnSearch.disabled = true;
  clearGallery();
  //   newsApiService.onTotalPageReset();
  //   refs.btnLoadMore.disabled = false;

  //   newsApiService.searchGelleryPhoto().then(articles => {
  //     // if (res.data.hits.length === 0) {
  //     //   refs.btnLoadMore.classList.add('is-hidden');
  //     //   return Notify.failure(
  //     //     `"Sorry, there are no images matching your search query. Please try again."`
  //     //   );
  //     // }
  //     clearGallery();
  //     galleryRender(articles.data.hits);

  //     loadMoreBtn.enable();
  //     // refs.btnLoadMore.classList.remove('is-hidden');

  //     // Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
  //     // galleryRender(res.data.hits);
  //     // refs.btnLoadMore.classList.remove('is-hidden');
  //     // newsApiService.onTotalPage();
  //     // refs.form.reset();
  //   });
  // .catch();
}

function onLoadMore() {
  newsApiService.incrementPage();

  fetchArticals();

  //   newsApiService.searchGelleryPhoto().then(res => {
  //     // if (res.data.totalHits <= newsApiService.totalPage) {
  //     //   refs.btnLoadMore.disabled = true;
  //     //   refs.btnSearch.disabled = false;
  //     //   return Notify.warning(
  //     //     "We're sorry, but you've reached the end of search results."
  //     //   );
  //     // }
  //     newsApiService.onTotalPage();

  //   });
  //   .catch(error => {
  //     console.log(error);
  //   });;
}

function fetchArticals() {
  loadMoreBtn.disable();
  newsApiService.searchGelleryPhoto().then(articles => {
    galleryRender(articles.data.hits);
    loadMoreBtn.enable();
  });
}

function galleryRender(photos) {
  const gallery = photos
    .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
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

function clearGallery() {
  refs.gallery.innerHTML = '';
}
