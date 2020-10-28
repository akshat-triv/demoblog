import axios from 'axios';
import 'regenerator-runtime/runtime';
import { sendAlert } from './alerts';

const search = document.querySelector('.search');
const counterLike = document.getElementById('counterLike');
const counterDislike = document.getElementById('counterDislike');
const nocomments = document.querySelector('.nocomm');
const likeBox = document.querySelector('.like');
const commentForm = document.querySelector('.comments__add');
const commentsAfter = document.getElementById('commentsAfter');
let articleId = document.getElementById('main');
const codeBlock = document.querySelectorAll('.code');
const likeIcon = document.querySelector('.li');
const dislikeIcon = document.querySelector('.di');

function sendSearch(query) {
  location.assign(`/search/${query}`, true);
}

window.addEventListener('load', function () {
  if (articleId) articleId = articleId.dataset.article;
  if (localStorage.getItem(articleId)) {
    if (localStorage.getItem(articleId) === 'liked')
      likeIcon.classList.add('li--active');
    else if (localStorage.getItem(articleId) === 'disliked')
      dislikeIcon.classList.add('li--active');
  }
  if (likeBox) {
    likeFormattor(counterLike.dataset.count, 'likes');
    likeFormattor(counterDislike.dataset.count, 'dislikes');
  }
  if (codeBlock) {
    Array.from(codeBlock).forEach((cdB) => {
      let code = cdB.textContent;
      code = code.split('%*%').join('<br>');
      cdB.innerHTML = code;
    });
  }
});

async function updateLike(which, what) {
  let res, updated, curr;
  try {
    res = await axios({
      method: 'GET',
      url: `/api/v1/article/${articleId}`,
    });
  } catch (err) {
    sendAlert('fail', `${err}`);
  }
  if (res) curr = res.data.data.article[which];
  let obj = {};
  obj[which] = curr + what;

  try {
    res = await axios({
      method: 'PATCH',
      url: `/api/v1/article/${articleId}`,
      data: obj,
    });
  } catch (err) {
    sendAlert('fail', `${err}`);
  }

  updated = res.data.data.article[which];
  return updated;
}

function likeFormattor(number, which) {
  let l = `${number}`.length;
  let newNumber;
  if (l > 3) {
    newNumber = `${number}`.slice(0, l - 3);
    newNumber = `${newNumber}K`;
  } else {
    newNumber = `${number}`;
  }
  if (which === 'likes') {
    counterLike.textContent = newNumber;
  } else {
    counterDislike.textContent = newNumber;
  }
}

async function sendComment(person) {
  commentsAfter.insertAdjacentHTML(
    'afterend',
    `<p class='person'>${person.name}</p><p class='message'>${person.message}</p>`
  );

  if (nocomments) nocomments.parentNode.removeChild(nocomments);

  try {
    await axios({
      method: 'POST',
      url: `/api/v1/comment`,
      data: {
        articleId,
        name: person.name,
        comment: person.message,
      },
    });
  } catch (err) {
    sendAlert('fail', `${err}`);
  }
}

search.addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.querySelector('.search__bar').value;
  sendSearch(query);
});

if (commentForm) {
  commentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const message = document.getElementById('comment').value;
    await sendComment({ name, message });
  });
}

if (likeBox) {
  likeBox.addEventListener('click', async function (e) {
    let updated;
    e.preventDefault();
    let el = e.target.closest('svg');
    if (Array.from(el.classList).includes('li')) {
      el.classList.toggle('li--active');
      if (Array.from(el.classList).includes('li--active')) {
        if (
          Array.from(document.querySelector('.li').classList).includes(
            'li--active'
          )
        ) {
          document.querySelector('.di').classList.remove('li--active');
          updated = await updateLike('dislikes', -1);
          likeFormattor(updated, 'dislikes');
        }
        updated = await updateLike('likes', 1);
        likeFormattor(updated, 'likes');
        localStorage.setItem(articleId, 'liked');
      } else {
        updated = await updateLike('likes', -1);
        likeFormattor(updated, 'likes');
        localStorage.removeItem(articleId);
      }
    } else if (Array.from(el.classList).includes('di')) {
      el.classList.toggle('li--active');
      if (Array.from(el.classList).includes('li--active')) {
        if (
          Array.from(document.querySelector('.li').classList).includes(
            'li--active'
          )
        ) {
          document.querySelector('.li').classList.remove('li--active');
          updated = await updateLike('likes', -1);
          likeFormattor(updated, 'likes');
        }
        updated = await updateLike('dislikes', 1);
        likeFormattor(updated, 'dislikes');
        localStorage.setItem(articleId, 'disliked');
      } else {
        updated = await updateLike('dislikes', -1);
        likeFormattor(updated, 'dislikes');
        localStorage.removeItem(articleId);
      }
    }
  });
}
