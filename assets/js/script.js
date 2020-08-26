var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Allowing edit to be commenced on click of the P textarea
$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// Blur allowing the editing to be saved upon clicking outside of the textarea
$(".list-group").on("blur", "textarea", function(){
  // get the textarea's current value/text
  var text = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  tasks[status][index].text = text;
  saveTasks();

  // To recreate the P element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // To replace the TextArea with the P element
  $(this).replaceWith(taskP);
});

// To commence editing of the Due Date
$(".list-group").on("click", "span", function(){
  // To get current Text
  var date = $(this)
  .text()
  .trim();

  // To create the new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  // To swap out Elements
  $(this).replaceWith(dateInput);

  // To automatically focus on a new element
  dateInput.trigger("focus");
});

// When the value of Due Date is changed
$(".list-group").on("blur", "input[type='text']", function() {
  // To get current text
  var date = $(this)
  .val()
  .trim();

  // To get the parent Ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // To get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // To update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // To recreate span element with bootS classes
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  // To replace input with span element
  $(this).replaceWith(taskSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
    var text = $(this)
    .find("p")
    .text()
    .trim();

    var date = $(this)
    .find("span")
    .text()
    .trim();

    // To add task data to the temp array
    tempArr.push({
      text: text,
      date: date
     });
    });
    // To trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // To update array with new tasks object & save it
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// Function for drag-to-remove card
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();