import axios from 'axios';

export default class NewsApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.totalPage = 0;
  }

  async searchGelleryPhoto() {
    console.log(this);

    const URL = 'https://pixabay.com/api/';
    const params = {
      key: '25684992-ec31d25fc66c7364d0851b638',
      q: `${this.searchQuery}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: `${this.page}`,
    };

    const res = await axios.get(URL, { params });

    return res;
  }
  onTotalPage() {
    this.totalPage += 40;
  }
  onTotalPageReset() {
    this.totalPage = 40;
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  get numberPage() {
    return this.totalPage;
  }
  set numberPage(newPage) {
    this.totalPage = newPage;
  }
}

//  console.log(res.data);
//  galleryRender(res.data.hits);
//  refs.btnLoadMore.classList.remove('is-hidden');
