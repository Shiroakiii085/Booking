$(document).ready(function() {
  const USERS_API_URL = "https://67cbf7be3395520e6af6c610.mockapi.io/users"; // Nếu có API người dùng, thay vào đây

  // Hàm hiển thị Toast, đồng bộ với index.js
  function showToast(message, type = "success") {
    const toast = $("#actionToast");
    toast.removeClass("toast-success toast-danger").addClass(`toast-${type}`);
    toast.find(".toast-body").text(message);
    toast.toast({ delay: 3000 });
    toast.toast("show");
  }

  // Kiểm tra quyền truy cập trang admin
  if (window.location.pathname.includes("admin.html")) {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser !== "eldenlord") {
      showToast("Bạn không có quyền truy cập trang này!", "danger");
      setTimeout(() => window.location.href = "login.html", 1000);
    }
  }

  // Xử lý form đăng nhập
  $("#login-form").submit(function(event) {
    event.preventDefault();
    const username = $("#username").val().trim();
    const password = $("#password").val().trim();

    if (username === "admin" && password === "1") {
      localStorage.setItem("loggedInUser", username);
      setTimeout(() => window.location.href = "admin.html", 1000);
    } else {
      showToast("Username or Password is incorrect!", "danger");
    }
  });
});