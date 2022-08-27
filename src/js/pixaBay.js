import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';
export default class PixaBay {
  constructor() {
    this.currentPage = 1;
    this.per_page = 40;
    this.inProcess = false;
    this.nothingMore = false;
    this.totalPages = 1;
  }
  async fetchImgs(query) {
    if (this.inProcess) return Promise.reject('In process...');
    if (query) {
      this.query = query;
      this.currentPage = 1;
      this.nothingMore = false;
      this.totalPages = 1;
    }
    if (this.nothingMore) return Promise.reject('Nothing more...');
    this.inProcess = true;
    try {
      const request = await axios.get(BASE_URL, {
        params: {
          key: '29531831-dbf8f491323bf6a8b4e4c4edd',
          q: this.query,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: this.per_page,
          page: this.currentPage,
        },
      });
      if (query) {
        this.totalPages = Math.ceil(request.data.totalHits / this.per_page);
      }
      this.currentPage += 1;
      if (this.totalPages < this.currentPage) this.nothingMore = true;
      this.inProcess = false;
      return request.data;
    } catch (msg) {
      this.inProcess = false;
      throw Error(msg);
    }
  }
}
