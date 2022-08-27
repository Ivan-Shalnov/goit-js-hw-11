import refs from './refs';
import PixaBay from './pixaBay';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import millify from 'millify';
import throttle from 'lodash.throttle';
import { Notify } from 'notiflix';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.min.css';
const scroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  offset: [0, '10%'],
  tablet: {
    smooth: true,
  },
  smartphone: {
    smooth: true,
  },
});
const throttleLoadMore = throttle(() => {
  loadMore();
  scroll.update();
}, 30);
const pixaBayApi = new PixaBay();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
// const throttleScrollHandle = throttle(scrollHandler, 50);
refs.form.addEventListener('submit', searchImgs);

async function searchImgs(event) {
  event.preventDefault();
  const query = refs.form.elements.searchQuery.value.trim();

  showLoader();
  try {
    const result = await pixaBayApi.fetchImgs(query);
    if (result.hits.length === 0) {
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      hideLoader();
      return;
    }
    scroll.scrollTo('top');
    Notify.info(`Hooray! We found ${result.totalHits} images.`);
    clearGallery();
    renderGallery(result.hits);
    lightbox.refresh();
    scroll.on('scroll', scrollHandler);
    hideLoader();
  } catch (error) {
    Notify.failure(error.message);
  }
  scroll.update();
}

function scrollHandler(event) {
  // Animate opacity
  const arrOfElements = Object.values(event.currentElements);
  if (arrOfElements.length > 0) {
    arrOfElements.forEach(({ el, progress }) => {
      el.style.opacity = progress * 3 > 1 ? 1 : progress * 3;
    });
  }
  //   LoadMore
  if (
    !pixaBayApi.nothingMore &&
    !pixaBayApi.inProcess &&
    event.limit.y - event.delta.y < 150
  ) {
    console.log('loadmore');
    throttleLoadMore();
  }
}
async function loadMore() {
  showLoader();

  try {
    const result = await pixaBayApi.fetchImgs();
    renderGallery(result.hits);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
  hideLoader();
}
function showLoader() {
  refs.loader.classList.remove('is-hidden');
  refs.searchBtn.disabled = true;
}
function hideLoader() {
  refs.loader.classList.add('is-hidden');
  refs.searchBtn.disabled = false;
}
function clearGallery() {
  refs.galleryCont.innerHTML = '';
}
function renderGallery(array) {
  const markup = array.map(imgTmpl).join('');
  refs.galleryCont.insertAdjacentHTML('beforeend', markup);
}
function imgTmpl({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <div class="photo-card" data-scroll>
        <a href="${largeImageURL}">
        <div class="thumb">
        <img src="${webformatURL}" alt="${tags}" />
        </div>
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${millify(likes)}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${millify(views)}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${millify(comments)}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${millify(downloads)}
          </p>
        </div>
      </div>
    `;
}
