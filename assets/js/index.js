$(document).ready(function () {
  // Hàm hiển thị Toast
  function showToast(message, type = "success") {
    const toast = $("#actionToast");
    toast.removeClass("toast-success toast-danger").addClass(`toast-${type}`);
    toast.find(".toast-body").text(message);
    toast.toast({ delay: 3000 });
    toast.toast("show");
  }

  // Xử lý form liên hệ
  $("#contact-form").submit(function (event) {
    event.preventDefault();
    const name = $("#contact-name").val().trim();
    const email = $("#contact-email").val().trim();
    const message = $("#contact-message").val().trim();

    if (!name || !email || !message) {
      showToast("Please fill in all fields!", "danger");
      return;
    }

    showToast(`Thank you, ${name}! Your message has been sent.`, "success");
    $("#contact-form")[0].reset();
  });

  // Xử lý form booking
  $("#booking-form").submit(function (event) {
    event.preventDefault();
    const roomId = $("#hotel-select").val();
    const name = $("#booking-name").val().trim();
    const email = $("#booking-email").val().trim();
    const date = $("#booking-date").val();
    const today = new Date().toISOString().split("T")[0];

    if (!roomId || !name || !email || !date) {
      showToast("Please fill in all fields!", "danger");
      return;
    }
    if (date < today) {
      showToast("Check-in date cannot be in the past!", "danger");
      return;
    }

    $.ajax({
      url: `https://67cbf7be3395520e6af6c610.mockapi.io/rooms/${roomId}`,
      method: "PUT",
      data: JSON.stringify({ status: "booked" }),
      contentType: "application/json",
      beforeSend: function () {
        $("#booking-form button").html('<span class="spinner-border spinner-border-sm" role="status"></span> Booking...').prop("disabled", true);
      },
      success: function () {
        showToast(`Thank you, ${name}! Room booked for ${date}.`, "success");
        $("#booking-form")[0].reset();
        $("#hotel-select").val("");
        updateRoomList();
      },
      error: function (err) {
        console.error("Error booking room:", err);
        showToast("Booking failed. Please try again!", "danger");
      },
      complete: function () {
        $("#booking-form button").html("Book Now").prop("disabled", false);
      },
    });
  });

  // Hàm cập nhật danh sách phòng và dropdown dựa trên Hotel_Address
  function updateRoomList(searchTerm = "", selectedAddress = "") {
    $.ajax({
      url: "https://67cbf7be3395520e6af6c610.mockapi.io/rooms",
      method: "GET",
      beforeSend: function () {
        $("#room-list").html('<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
      },
      success: function (rooms) {
        let roomList = $("#room-list");
        roomList.empty();
        let roomSelect = $("#hotel-select");
        roomSelect.empty();
        roomSelect.append('<option value="">Choose a hotel...</option>');

        const filteredRooms = rooms.filter(room => 
          (!selectedAddress || (room.Hotel_Address && room.Hotel_Address.toLowerCase() === selectedAddress.toLowerCase())) &&
          room.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredRooms.length === 0) {
          roomList.append('<div class="col-12 text-center">No rooms found</div>');
          return;
        }

        filteredRooms.forEach((room) => {
          let card = `
              <div class="col-md-4 mb-4">
                <div class="card text-bg-dark">
                  <img src="${room.image}" class="card-img-top" alt="${room.name}">
                  <div class="card-body">
                    <h5 class="card-title">${room.name}</h5>
                    <p class="card-text">$${room.price}/night</p>
                    <p class="card-text">${room.Hotel_Address || 'Unknown Address'}</p>
                    <button class="btn btn-warning book-btn" data-id="${room.id}" ${room.status === 'booked' ? 'disabled' : ''}>
                      ${room.status === 'booked' ? 'Booked' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>`;
          roomList.append(card);
          if (room.status === "available") {
            roomSelect.append(`<option value="${room.id}">${room.name} - $${room.price}/night (${room.Hotel_Address || 'Unknown'})</option>`);
          }
        });
      },
      error: function (err) {
        console.error("Error fetching rooms:", err);
        showToast("Error loading rooms!", "danger");
      },
    });
  }

  // Hàm lấy danh sách địa chỉ duy nhất từ API
  function populateAddressDropdown() {
    $.ajax({
      url: "https://67cbf7be3395520e6af6c610.mockapi.io/rooms",
      method: "GET",
      success: function (rooms) {
        const addressSelect = $("#city-select");
        addressSelect.empty();
        addressSelect.append('<option value="">Select an address...</option>');

        const addresses = [...new Set(rooms.map(room => room.Hotel_Address).filter(address => address))];
        addresses.forEach(address => {
          addressSelect.append(`<option value="${address}">${address}</option>`);
        });
      },
      error: function (err) {
        console.error("Error fetching addresses:", err);
        showToast("Error loading addresses!", "danger");
      }
    });
  }

  // Hiển thị danh sách phòng ban đầu và xử lý sự kiện
  if ($("#room-list").length) {
    populateAddressDropdown();

    $("#city-select").on("change", function () {
      const selectedAddress = $(this).val();
      const searchTerm = $("#search-room").val();
      updateRoomList(searchTerm, selectedAddress);
    });

    $("#search-room").on("input", function () {
      const searchTerm = $(this).val();
      const selectedAddress = $("#city-select").val();
      updateRoomList(searchTerm, selectedAddress);
    });

    $(document).on("click", ".book-btn", function () {
      let roomId = $(this).data("id");
      if (confirm("Are you sure you want to book this room?")) {
        $.ajax({
          url: `https://67cbf7be3395520e6af6c610.mockapi.io/rooms/${roomId}`,
          method: "PUT",
          data: JSON.stringify({ status: "booked" }),
          contentType: "application/json",
          success: function () {
            showToast(`Room booked successfully!`, "success");
            const selectedAddress = $("#city-select").val();
            updateRoomList("", selectedAddress);
          },
          error: function (err) {
            console.error("Error booking room:", err);
            showToast("Error booking room!", "danger");
          }
        });
      }
    });
  }
});