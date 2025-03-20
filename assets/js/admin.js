$(document).ready(function () {
  // Hàm hiển thị Toast
  function showToast(message, type = "success") {
    const toast = $("#actionToast");
    toast.removeClass("toast-success toast-danger").addClass(`toast-${type}`);
    toast.find(".toast-body").text(message);
    toast.toast({ delay: 3000 });
    toast.toast("show");
  }

  // Hiển thị danh sách phòng
  function renderRoomTable(searchTerm = "") {
    $.ajax({
      url: "https://67cbf7be3395520e6af6c610.mockapi.io/rooms",
      method: "GET",
      beforeSend: function () {
        $("#room-table").html('<tr><td colspan="6" class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>');
      },
      success: function (rooms) {
        let tableBody = $("#room-table");
        tableBody.empty();
        const filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filteredRooms.length === 0) {
          tableBody.append('<tr><td colspan="6" class="text-center">No rooms found</td></tr>');
          return;
        }
        filteredRooms.forEach((room) => {
          let row = `
              <tr data-id="${room.id}">
                <td>${room.id}</td>
                <td>${room.name}</td>
                <td>${room.Hotel_Address || 'Unknown'}</td>
                <td>${room.status}</td>
                <td>$${room.price}</td>
                <td>
                  <button class="btn btn-sm btn-primary edit-btn" data-id="${room.id}">Edit</button>
                  <button class="btn btn-sm btn-danger delete-btn" data-id="${room.id}">Delete</button>
                </td>
              </tr>`;
          tableBody.append(row);
        });
      },
      error: function (err) {
        console.error("Error fetching rooms:", err);
        showToast("Error loading rooms!", "danger");
      },
    });
  }

  if ($("#room-table").length) {
    renderRoomTable();

    $("#search-room").on("input", function () {
      const searchTerm = $(this).val();
      renderRoomTable(searchTerm);
    });

    $("#save-room-btn").click(function () {
      let newRoom = {
        name: $("#room-name").val().trim(),
        Hotel_Address: $("#room-address").val().trim(),
        price: parseInt($("#room-price").val()),
        status: "available",
        image: $("#room-image").val().trim(),
      };

      if (!newRoom.name || !newRoom.Hotel_Address || isNaN(newRoom.price) || !newRoom.image || newRoom.price < 0) {
        showToast("Please fill in all fields correctly!", "danger");
        return;
      }

      $.ajax({
        url: "https://67cbf7be3395520e6af6c610.mockapi.io/rooms",
        method: "POST",
        data: JSON.stringify(newRoom),
        contentType: "application/json",
        beforeSend: function () {
          $("#save-room-btn").html('<span class="spinner-border spinner-border-sm" role="status"></span> Saving...').prop("disabled", true);
        },
        success: function () {
          renderRoomTable();
          $("#addRoomModal").modal("hide");
          $("#add-room-form")[0].reset();
          showToast("Room added successfully!");
        },
        error: function (err) {
          console.error("Error adding room:", err);
          showToast("Error adding room!", "danger");
        },
        complete: function () {
          $("#save-room-btn").html("Save").prop("disabled", false);
        },
      });
    });

    $(document).on("click", ".delete-btn", function () {
      const roomId = $(this).data("id");
      $("#delete-room-id").val(roomId);
      $("#deleteConfirmModal").modal("show");
    });

    $("#confirm-delete-btn").click(function () {
      const roomId = $("#delete-room-id").val();
      $.ajax({
        url: `https://67cbf7be3395520e6af6c610.mockapi.io/rooms/${roomId}`,
        method: "DELETE",
        beforeSend: function () {
          $("#confirm-delete-btn").html('<span class="spinner-border spinner-border-sm" role="status"></span> Deleting...').prop("disabled", true);
        },
        success: function () {
          renderRoomTable();
          $("#deleteConfirmModal").modal("hide");
          showToast("Room deleted successfully!");
        },
        error: function (err) {
          console.error("Error deleting room:", err);
          showToast("Error deleting room!", "danger");
        },
        complete: function () {
          $("#confirm-delete-btn").html("Delete").prop("disabled", false);
        },
      });
    });

    $(document).on("click", ".edit-btn", function () {
      let roomId = $(this).data("id");
      $.ajax({
        url: `https://67cbf7be3395520e6af6c610.mockapi.io/rooms/${roomId}`,
        method: "GET",
        success: function (room) {
          $("#edit-room-id").val(room.id);
          $("#edit-room-name").val(room.name);
          $("#edit-room-address").val(room.Hotel_Address);
          $("#edit-room-price").val(room.price);
          $("#edit-room-status").val(room.status);
          $("#edit-room-image").val(room.image);
          $("#editRoomModal").modal("show");
        },
        error: function (err) {
          console.error("Error fetching room:", err);
          showToast("Error fetching room!", "danger");
        },
      });
    });

    $("#update-room-btn").click(function () {
      let updatedRoom = {
        id: $("#edit-room-id").val(),
        name: $("#edit-room-name").val().trim(),
        Hotel_Address: $("#edit-room-address").val().trim(),
        price: parseInt($("#edit-room-price").val()),
        status: $("#edit-room-status").val(),
        image: $("#edit-room-image").val().trim(),
      };

      if (!updatedRoom.name || !updatedRoom.Hotel_Address || isNaN(updatedRoom.price) || !updatedRoom.image || updatedRoom.price < 0) {
        showToast("Please fill in all required fields correctly!", "danger");
        return;
      }

      $.ajax({
        url: `https://67cbf7be3395520e6af6c610.mockapi.io/rooms/${updatedRoom.id}`,
        method: "PUT",
        data: JSON.stringify(updatedRoom),
        contentType: "application/json",
        beforeSend: function () {
          $("#update-room-btn").html('<span class="spinner-border spinner-border-sm" role="status"></span> Updating...').prop("disabled", true);
        },
        success: function () {
          renderRoomTable();
          $("#editRoomModal").modal("hide");
          $("#edit-room-form")[0].reset();
          showToast("Room updated successfully!");
        },
        error: function (err) {
          console.error("Error updating room:", err);
          showToast("Error updating room!", "danger");
        },
        complete: function () {
          $("#update-room-btn").html("Update").prop("disabled", false);
        },
      });
    });
  }
});