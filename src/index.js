import { Notify } from 'notiflix';
import axios from 'axios';
Notify.success('Sol lucet omnibus');

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};
refs.form.addEventListener('submit', searchImage);

const URL = 'https://pixabay.com/api/';
const KEY_API = '25684992-ec31d25fc66c7364d0851b638';

async function searchImage(e) {
  e.preventDefault();
  console.log(e.currentTarget.elements.searchQuery.value);
  const params = {
    key: KEY_API,
    q: e.currentTarget.elements.searchQuery.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };
  await axios
    .get(URL, { params })
    .then(res => {
      galleryRender(res.data.hits);
    })
    .catch(error => {
      console.log(error);
    });
}
function galleryRender(photos) {
  const gallery = photos
    .map(({ webformatURL, likes, views, comments, downloads }) => {
      //   console.log(e.target.elements.searchQuery.value);
      return `
    <div class="photo-card">
  <img src=${webformatURL} alt="" loading="lazy" class='img-card'/>
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
