//$(document).on("click", "button.delete-note", deleteNote);
$("#scrape-btn").on("click", function(event) {
  // scrape articles
  console.log("scraped");
  setTimeout(function() {
    location.reload();
  }, 4000);
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function(data) {});
});

$(".toggle-saved").on("click", function(event) {
  // save/delete articles
  event.preventDefault();
  var id = $(this).data("id");
  var newSaved = $(this).data("newsaved");
  var newSavedState = {
    saved: newSaved
  };

  $.ajax({
    method: "POST",
    url: "/articles/" + id,
    data: newSavedState
  }).then(function(data) {
    location.reload(); // reload the page to get the updated list
  });
});

function viewNote(noteData) {
  console.log("noteData");
  console.log(noteData);

  $("#article-notes").empty();
  for (var i = 0; i < noteData.length; i++) {
    var cardBody = $(`<div class="card">
            <div class="card-body">
                <p class="card-text">${noteData[i].text}</p>
                <button type="button" value="submit" class="btn-danger delete-note" data-id="${
                  noteData[i]._id
                }">x</button>
            </div>
          </div>`);
    $("#article-notes").append(cardBody);
  }
}

function refreshNotes(articleData) {
  var thisId = articleData._id;
  $.ajax({
    method: "GET",
    // url: "/notes/" + thisId
    url: `/notes/${thisId}`
  }).then(function(data) {
    console.log("displaynotes: ");
    console.log(data);
    viewNote(data);
  });
}

$(".view-notes").on("click", function(event) {
  // opens modal with notes of selected article
  var thisId = $(this).attr("data-id");
  $("#save-note").attr("data-id", thisId); // assigns article id to modal save note button
  $("#article-notes").attr("data-articleId", thisId); // assigns article id to modal notes div
  $("#note-title").text("Notes for article " + $("#save-note").data("id"));
  $.ajax({
    method: "GET",
    url: "/notes/" + thisId
  }).then(function(data) {
    viewNote(data);
  });
});

// When you click the savenote button
$(document).on("click", "#save-note", function() {
  // $("#save-note").on("click", function (event) {
  var thisId = $(this).attr("data-id");
  if (!$("#notes-form").val()) {
    alert("No note was entered");
  } else {
    $.ajax({
      method: "POST",
      url: "/notes/" + thisId,
      data: {
        text: $("#notes-form").val()
      }
    }).then(function(data) {
      console.log("savenote");
      console.log(data);
      refreshNotes(data);
    });

    $("#notes-form").val("");
  }
});

$("#article-notes").on("click", ".delete-note", function() {
  // deletes note
  var thisId = $(this).attr("data-id");
  var articleId = $("#article-notes").attr("data-articleId");
  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId
  }).then(function(data) {
    data._id = articleId;
    refreshNotes(data);
  });
});
