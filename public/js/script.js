$(document).ready(function () {
  const $searchBar = $('.search-bar');
  const $searchInput = $('#searchInput'); // corrected id
  const $searchClose = $('#search-close');

  $('.search-btn').on('click', function (e) {
    $searchBar.addClass('open');
    $(this).attr('aria-expanded', 'true');
    $searchInput.focus();
  });

  $searchClose.on('click', function () {
    $searchBar.removeClass('open');
    $('.search-btn').attr('aria-expanded', 'false');
  });
});