import { Notify } from 'notiflix';
import NewsApiService from './new-service';
import debounce from 'lodash.debounce';
import LoadMoreBtn from './load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

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

refs.form.addEventListener('submit', searchImage);
loadMoreBtn.refs.button.addEventListener('click', getCollectionPhotoRequest);
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
  getCollectionPhotoRequest();
  refs.btnSearch.disabled = true;
  clearPhotoGallery();

  refs.form.reset();
}
//отримання статьи
function getCollectionPhotoRequest() {
  loadMoreBtn.disable();

  newsApiService.searchGelleryPhoto().then(articles => {
    if (articles.data.hits.length === 0) {
      loadMoreBtn.hide();
      return failure();
    }
    if (newsApiService.totalPage >= 500) {
      warning();
      loadMoreBtn.hide();

      photoGalleryRenderer(articles.data.hits);
      return;
    }
    if (articles.data.hits.length < 40) {
      if (newsApiService.page === 1) {
        success(articles);
      }

      photoGalleryRenderer(articles.data.hits);
      loadMoreBtn.hide();
      return;
    }

    if (newsApiService.page === 1) {
      success(articles);
    }

    photoGalleryRenderer(articles.data.hits);
    if (articles.data.totalHits < 20) {
      loadMoreBtn.hide();
    }
    newsApiService.incrementPage();
    newsApiService.onTotalPage();
    loadMoreBtn.enable();
  });
}
//рендер галерей фото по запиту з серверу
function photoGalleryRenderer(photos) {
  console.log(photos);
  const gallery = photos
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) => {
        return `
    <div  class="photo-card">
 <a href='${largeImageURL}'><img src=${webformatURL} alt="${tags}" loading="lazy" class='img-card'/></a> 
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
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', gallery);

  //? налаштування бібліотеки simplelightbox
  let lightbox = new SimpleLightbox('.gallery a', {
    overlayOpacity: 0.8,
    animationSpeed: 300,
  });
}
//очистити вміст контейнеру з фото
function clearPhotoGallery() {
  refs.gallery.innerHTML = '';
}

// повыдомлення бібліотека Notify
function failure() {
  Notify.failure(
    `"Sorry, there are no images matching your search query. Please try again."`
  );
}
// повыдомлення бібліотека Notify
function success(articles) {
  Notify.success(`Hooray! We found ${articles.data.totalHits} images.`);
}

// повыдомлення бібліотека Notify
function warning() {
  Notify.warning("We're sorry, but you've reached the end of search results.");
}

//! опрацювання помилки 400-404
//! розібратись чому мигает кнопка Loading... при завантаженні сторінки на git
