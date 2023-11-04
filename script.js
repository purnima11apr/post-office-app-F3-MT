// Execute all functions except redirectToMap on page load
$(document).ready(function () {
  // Get the user's IP address using the API
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    // Setting text of element P with id gfg
    $("#ip-address").html(data.ip);

    const userIP = data.ip;
    const apiUrl = `https://ipapi.co/${userIP}/json/`;

    $.getJSON(apiUrl, function (apiData) {
      populateData(apiData);
      localStorage.setItem("apiData", JSON.stringify(apiData));
    }).fail(function (jqxhr, textStatus, error) {
      const err = textStatus + ", " + error;
      console.error("Error fetching data from the API: " + err);
    });
  });
});

function redirectToMap() {
  // Redirect to map.html
  window.location.href = "map.html";

  const storedData = localStorage.getItem("apiData");

  if (storedData) {
    const apiData = JSON.parse(storedData);

    console.log(apiData);

    localStorage.removeItem("apiData");
  }
}

function populateData(apiData) {
  $("#ip-address2").text(apiData.ip);
  $(".lat-long div:nth-child(1) span:nth-child(1)").text(apiData.latitude);
  $(".lat-long div:nth-child(1) span:nth-child(2)").text(apiData.longitude);
  $(".lat-long div:nth-child(2) span:nth-child(1)").text(apiData.city);
  $(".lat-long div:nth-child(2) span:nth-child(2)").text(apiData.region);
  $(".lat-long div:nth-child(3) span:nth-child(1)").text(apiData.org);
  $(".lat-long div:nth-child(3) span:nth-child(2)").text(apiData.hostname);
  $("div.more-info p:nth-child(1) span").text(apiData.timezone);
  $("div.more-info p:nth-child(3) span").text(apiData.postal);

  const latitude = apiData.latitude;
  const longitude = apiData.longitude;
  const zoomLevel = 10;
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  const iframe = `<iframe src="${mapUrl}" width="1200" height="500" frameborder="0" style="border:0"></iframe>`;
  $("#map").html(iframe);

  const timeZone = apiData.timezone;
  const options = { timeZone: timeZone, timeStyle: "medium" };
  const currentTime = new Date().toLocaleString("en-US", options);
  $("div.more-info p:nth-child(2) span").text(currentTime);

  const pincode = apiData.postal;
  const pincodeUrl = `https://api.postalpincode.in/pincode/${pincode}`;
  $.getJSON(pincodeUrl, function (data) {
    const responseData = data[0];
    const postOffices = responseData.PostOffice;

    // Extract and display all postal codes
    const postalCodes = postOffices.map((postOffice) => postOffice.Pincode);
    $("div.more-info p:nth-child(4) span").text(postalCodes.join(", "));

    // Creating and updating the HTML with post office details
    const cardsContainer = $(".cards");
    cardsContainer.empty();
    let flexContainer = $("<div class='flex'></div>");
    postOffices.forEach((postOffice) => {
      const card = `
            <div class="card">
                <p>Name: <span>${postOffice.Name}</span></p>
                <p>Branch Type: <span>${postOffice.BranchType}</span></p>
                <p>Delivery Status: <span>${postOffice.DeliveryStatus}</span></p>
                <p>District: <span>${postOffice.District}</span></p>
                <p>Division: <span>${postOffice.Division}</span></p>
            </div>
        `;
      flexContainer.append(card);
      if (flexContainer.children().length === 2) {
        cardsContainer.append(flexContainer);
        flexContainer = $("<div class='flex'></div>");
      }
    });
    if (flexContainer.children().length > 0) {
      cardsContainer.append(flexContainer);
    }

    // Creating a search box to filter post offices by name and branch office

    $("div.editable-div").on("input", function () {
      const searchText = $(this).text().toLowerCase();
      const filteredPostOffices = postOffices.filter((postOffice) => {
        return (
          postOffice.Name.toLowerCase().includes(searchText) ||
          postOffice.BranchType.toLowerCase().includes(searchText)
        );
      });
      cardsContainer.empty();
      let flexContainer = $("<div class='flex'></div>");
      filteredPostOffices.forEach((postOffice) => {
        const card = `
                <div class="card">
                    <p>Name: <span>${postOffice.Name}</span></p>
                    <p>Branch Type: <span>${postOffice.BranchType}</span></p>
                    <p>Delivery Status: <span>${postOffice.DeliveryStatus}</span></p>
                    <p>District: <span>${postOffice.District}</span></p>
                    <p>Division: <span>${postOffice.Division}</span></p>
                </div>
            `;
        flexContainer.append(card);
        if (flexContainer.children().length === 2) {
          cardsContainer.append(flexContainer);
          flexContainer = $("<div class='flex'></div>");
        }
      });
      if (flexContainer.children().length > 0) {
        cardsContainer.append(flexContainer);
      }
    });
  }).fail(function (jqxhr, textStatus, error) {
    // Handle any errors that occur during the GET request
    const err = textStatus + ", " + error;
    console.error("Error fetching data from the postalpincode API: " + err);
  });
}

$("div.editable-div").on("keypress", function remove() {
  $(this).text("");
});
