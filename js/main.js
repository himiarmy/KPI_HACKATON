let page = 1;

let pageSearch = 1;
render()

let tbody = $('.tbody');

// Добавление студента и баллов
$('.myForm').on('submit', function(e){
    e.preventDefault()
    
    let name = $('.myForm .name');
    let surname = $('.myForm .surname');
    let tasks = $('.myForm .tasks');
    let interview = $('.myForm .interview');
    let hack = $('.myForm .hack');
    
    
    
    // Заполненность полей
    if ( !name.val() || !surname.val() || !tasks.val() || !interview.val() ||  !hack.val()){
        return alert('Пожалуйста, заполните поля!')
    }
    
    
    let data = $('.myForm').serialize();
    
    // Сохранение на Json-server
    $.ajax({
        method: 'post',
        url: 'http://localhost:8000/students',
        data, 
        success: render,
        error: function(err){
            console.log(err)
        }
    });
    
    // Очищение ячеек
    name.val('');
    surname.val('');
    tasks.val('');
    interview.val('');
    hack.val('');
    kpi.val('');
})

// Отображение на странице и расчет KPI
function render(){
  $.ajax({
    method: 'get',
    url: `http://localhost:8000/students/?_page=${page}&_limit=5`,
    success: function(data){
      tbody.html('');
      data.forEach(item => {
        tbody.append(`
        <tr data-id="${item.id}">
          <td>${item.name}</td>
          <td>${item.surname}</td>
          <td>${item.tasks}</td>
          <td>${item.interview}</td>
          <td>${item.hack}</td>
          <td>${(
            Number(item.tasks) +
            Number(item.interview) +
            Number(item.hack)) / 3}
          </td>
          <td>
            <button id="btn-edit" data-id="${item.id}">Edit</button>
          </td>
          <td>
            <button class="btn-del" data-id="${item.id}">Delete</button>
          </td>    
        </tr>
        `)
      })
    }
  })
}
function paginationRender(data){
  $('.result').html('')
  data.map(item => {

    $('.result').append(`
      <li>
        <div>Name: <span>${item.name}</span></div>
        <div>Surname: <span>${item.surname}</span></div>
        <div>KPI: <span>${item.kpi}</span></div>
      </li>
    `)
  })
}


// Модальное окно
$(document).on('click', '.modal-fade', function(e) {
  if(e.target !== this)return;
  $('.modal-fade').toggle()
});

$(document).on('click', '.modal-close', function() {
  $('.modal-fade').toggle();
});

// Edit
tbody.on('click', '#btn-edit', function(e){
  let id = $(e.target).attr('data-id');
  $('.modal-fade').toggle();
  $('.modal-fade').attr('data-id', id) 
  $.ajax({
    method: 'get',
    url: `http://localhost:8000/students/${id}`,
    success: function(data){
      let i = 0;
      for (let key in data) {
        $(`.modal .${key}`).val(data[key])
      }
      let arr = [];

      fetch(`http://localhost:8000/students/${id}`)
      .then(result => result.json())
      .then(data => {
        arr.push(+data.tasks, +data.interview, +data.hack)
        console.log(arr)
      }
    );
    }
  })
})

$('.modal .btn').on('click', function(e) {
  e.preventDefault();
  let id = $('.modal-fade').attr('data-id');
  let data = $('.modal .inputs').serialize();
  console.log(id)
  $.ajax({
    method: 'patch',
    url: `http://localhost:8000/students/${id}`,
    data,
    success: () => {
      $('.modal-fade').toggle();
      render()
    }
  })
})

// Удаление
tbody.on('click', '.btn-del', (e) => {
  let s = confirm('Are you sure you want to delete?')
  let id = $(e.target).attr('data-id');
  if (s === true) {
  $.ajax({
    method: 'delete',
    url: `http://localhost:8000/students/${id}`,
    success: render
  });
  } else return;
});


// Пагинация
$('.prev-btn').on('click', function(){
  if (page === 1) {
    alert('Нет предыдущей страницы!');
    return;
  }
  --page;
  render();
});

$('.next-btn').on('click', function() {
  ++page;
  fetch(`http://localhost:8000/students/?_page=${page}&_limit=5`)
    .then(result => result.json())
    .then(data => {
      if (data.length === 0) {
          alert('Следующей страницы не существует!');
          page--;
          return;
      } else  {
        render();
      }
    })
});

let inpVal = '';

// Поиск
$('.search-btn').on('click', function(){
  let input = $('.search input').val()
  inpVal = $('.search input').val()
  if(input== '') {
    alert('Заполните поле поиска!')
    return;
  }

  $.ajax({
    method: 'get',
    url: `http://localhost:8000/students?_page=1&_limit=5&q=${input}`,
    success: function(data){
      if(data.length == 0){
        alert('Нет результатов поиска!');
        return;
      }
      $('.result-list').css('display', 'block');
      $('.result').html('');
      data.forEach(item => {
        $('.result').append(`
          <li>
              <div>Name: <span>${item.name}</span></div>
              <div>Surname: <span>${item.surname}</span></div>
              <div>KPI: <span>${item.kpi}</span></div>
          </li>          
        `)
      });
    }
  });
});


// Пагинация в поиске
$('.prev-btn-search').on('click', function(){
  if (pageSearch === 1) {
    alert('Нет предыдущей страницы!');
    return;
  }
  --pageSearch;
  fetch(`http://localhost:8000/students?_page=${pageSearch}&_limit=5&q=${inpVal}`)
    .then(result => result.json())
    .then(data => {
      if (data.length === 0) {
          alert('Следующей страницы не существует');
          pageSearch--;
          return;
      } else  {
        paginationRender(data);
      }
    })
});

$('.next-btn-search').on('click', function() {
  // console.log(pageSearch)
  ++pageSearch;
  // console.log(pageSearch)
  fetch(`http://localhost:8000/students?_page=${pageSearch}&_limit=5&q=${inpVal}`)
    .then(result => result.json())
    .then(data => {
      if (data.length === 0) {
          alert('Следующей страницы не существует');
          pageSearch--;
          return;
      } else  {
        paginationRender(data);
      }
    })
});
