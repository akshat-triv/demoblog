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
const paragraphs = document.querySelectorAll('.paragraph');
const notify = document.getElementById('notify');
const loginForm = document.querySelector('.form-login');

function sendSearch(query) {
  location.assign(`/search/${query}`, true);
}

$('.overview__box a').on('click', function () {
  const id = $(this).attr('href');
  //console.log(id);

  $('html,body').animate({ scrollTop: $(id).offset().top }, 500);
});

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
  if (paragraphs) {
    Array.from(paragraphs).forEach((para) => {
      let text = para.textContent;
      //console.log(text);
      text = text.replace(/ *\{[^)]*\} */g, (match) => {
        let l = match.length - 2;
        return `<span> ${match.slice(1, l)} </span>`;
      });
      para.innerHTML = text;
      //console.log(text);
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
    return sendAlert('fail', `${err.response.data.message}`);
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
    sendAlert('fail', `${err.response.data.message}`);
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
    counterLike.dataset.count = `${newNumber}`;
  } else {
    counterDislike.textContent = newNumber;
    counterDislike.dataset.count = `${newNumber}`;
  }
}

async function sendComment(person) {
  commentsAfter.insertAdjacentHTML(
    'afterend',
    `<p class='person'>${person.name}</p><p class='message'>${person.message}</p>`
  );
  let res;

  document.getElementById('name').value = '';
  document.getElementById('comment').value = '';

  if (nocomments) nocomments.parentNode.removeChild(nocomments);

  try {
    res = await axios({
      method: 'POST',
      url: `/api/v1/comment`,
      data: {
        articleId,
        name: person.name,
        comment: person.message,
      },
      onUploadProgress: function (progressEvent) {
        let loaded = Math.floor(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        loaded -= 10;
        document.querySelector('.loading').style.width = `${loaded}%`;
      },
    });
    if (res) {
      document.querySelector('.loading').style.width = `100%`;
      setTimeout(() => {
        document.querySelector('.loading').style.opacity = '0';
      }, 2000);
      setTimeout(() => {
        document.querySelector('.loading').style.width = `0%`;
        document.querySelector('.loading').style.opacity = '1';
      }, 100);
      sendAlert('success', 'Your comment was added successfully');
    }
  } catch (err) {
    sendAlert('fail', `${err.response.data.message}`);
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

if (notify) {
  notify.addEventListener('submit', async function (e) {
    e.preventDefault();
    let res;
    const name = document.getElementById('notify-name').value;
    const email = document.getElementById('notify-email').value;
    try {
      res = await axios({
        url: '/api/v1/user/',
        method: 'post',
        data: {
          name,
          email,
        },
        onUploadProgress: function (progressEvent) {
          let loaded = Math.floor(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          loaded -= 10;
          document.querySelector('.loading').style.width = `${loaded}%`;
        },
      });
      if (res) {
        document.querySelector('.loading').style.width = `100%`;
        setTimeout(() => {
          document.querySelector('.loading').style.opacity = '0';
        }, 1000);
        setTimeout(() => {
          document.querySelector('.loading').style.width = `0%`;
          document.querySelector('.loading').style.opacity = '1';
        }, 100);
        document.getElementById('notify-name').value = '';
        document.getElementById('notify-email').value = '';
        sendAlert('success', 'Thanks for subsribing to my blog');
      }
    } catch (err) {
      document.querySelector('.loading').style.width = `100%`;
      setTimeout(() => {
        document.querySelector('.loading').style.opacity = '0';
      }, 1000);
      setTimeout(() => {
        document.querySelector('.loading').style.width = `0%`;
        document.querySelector('.loading').style.opacity = '1';
      }, 100);
      sendAlert('fail', `${err.response.data.message}`);
    }
  });
}

if (likeBox) {
  likeBox.addEventListener('click', async function (e) {
    let updated;
    e.preventDefault();
    let el = e.target.closest('a');
    if (el && Array.from(el.classList).includes('li')) {
      el.classList.toggle('li--active');
      if (Array.from(el.classList).includes('li--active')) {
        updated = counterLike.dataset.count * 1 + 1;
        likeFormattor(updated, 'likes');
        localStorage.setItem(articleId, 'liked');
        if (
          Array.from(document.querySelector('.di').classList).includes(
            'li--active'
          )
        ) {
          updated = counterDislike.dataset.count * 1 - 1;
          likeFormattor(updated, 'dislikes');
          document.querySelector('.di').classList.remove('li--active');
          updated = await updateLike('dislikes', -1);
        }
        updated = await updateLike('likes', 1);
      } else {
        updated = counterLike.dataset.count * 1 - 1;
        likeFormattor(updated, 'likes');
        localStorage.removeItem(articleId);
        updated = await updateLike('likes', -1);
      }
    } else if (Array.from(el.classList).includes('di')) {
      el.classList.toggle('li--active');
      if (Array.from(el.classList).includes('li--active')) {
        updated = counterDislike.dataset.count * 1 + 1;
        likeFormattor(updated, 'dislikes');
        localStorage.setItem(articleId, 'disliked');
        if (
          Array.from(document.querySelector('.li').classList).includes(
            'li--active'
          )
        ) {
          updated = counterLike.dataset.count * 1 - 1;
          likeFormattor(updated, 'likes');
          document.querySelector('.li').classList.remove('li--active');
          updated = await updateLike('likes', -1);
        }
        updated = await updateLike('dislikes', 1);
      } else {
        updated = counterDislike.dataset.count * 1 - 1;
        likeFormattor(updated, 'dislikes');
        localStorage.removeItem(articleId);
        updated = await updateLike('dislikes', -1);
      }
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    let res;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      res = await axios({
        method: 'post',
        url: '/api/v1/admin/login',
        data: {
          email,
          password,
        },
        onUploadProgress: function (progressEvent) {
          let loaded = Math.floor(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          loaded -= 10;
          document.querySelector('.loading').style.width = `${loaded}%`;
        },
      });
      if (res) {
        document.querySelector('.loading').style.width = `100%`;
        setTimeout(() => {
          document.querySelector('.loading').style.opacity = '0';
        }, 1000);
        setTimeout(() => {
          document.querySelector('.loading').style.width = `0%`;
          document.querySelector('.loading').style.opacity = '1';
        }, 100);
        sendAlert('success', res.data.message);
        setTimeout(() => {
          location.assign('/', true);
        }, 4000);
      }
    } catch (err) {
      document.querySelector('.loading').style.width = `100%`;
      setTimeout(() => {
        document.querySelector('.loading').style.opacity = '0';
      }, 2000);
      setTimeout(() => {
        document.querySelector('.loading').style.width = `0%`;
        document.querySelector('.loading').style.opacity = '1';
      }, 100);
      sendAlert('fail', err.response.data.message);
    }
  });
}
