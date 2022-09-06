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
loadMoreBtn.refs.button.addEventListener('click', fetchArticals);
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
  newsApiService.onTotalPageReset();
  fetchArticals();
  refs.btnSearch.disabled = true;
  clearGallery();

  refs.form.reset();
}

// function onLoadMore() {
//   fetchArticals();
//   if (articles.data.totalHits <= newsApiService.totalPage) {
//     loadMoreBtn.hide();
//     return warning();
//   }
// }

function fetchArticals() {
  loadMoreBtn.disable();

  newsApiService.searchGelleryPhoto().then(articles => {
    if (articles.data.hits.length === 0) {
      loadMoreBtn.hide();
      return failure();
    }
    if (newsApiService.totalPage >= 500) {
      warning();
      loadMoreBtn.hide();
      galleryRender(articles.data.hits);
      return;
    }
    if (articles.data.hits.length < 40) {
      if (newsApiService.page === 1) {
        success(articles);
      }
      galleryRender(articles.data.hits);
      loadMoreBtn.hide();
      return;
    }

    if (newsApiService.page === 1) {
      success(articles);
    }

    galleryRender(articles.data.hits);
    if (articles.data.totalHits < 20) {
      loadMoreBtn.hide();
    }
    newsApiService.incrementPage();
    newsApiService.onTotalPage();
    loadMoreBtn.enable();
    console.log(articles);
    console.log(articles.data.totalHits);
    console.log(newsApiService.totalPage);
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

function failure() {
  Notify.failure(
    `"Sorry, there are no images matching your search query. Please try again."`
  );
}
function success(articles) {
  Notify.success(`Hooray! We found ${articles.data.totalHits} images.`);
}

function warning() {
  Notify.warning("We're sorry, but you've reached the end of search results.");
}
