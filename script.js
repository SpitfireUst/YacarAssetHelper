var updatedEntityJson;
var updatedAssetJson;

// Function to run on startup
async function onStartup() {
  try {
    updatedEntityJson = await fetchEntityData();
    updatedAssetJson = await fetchAssetData();
    const copyAssetJsonBtn = document.getElementById("copyEntityJsonBtn");
    copyAssetJsonBtn.disabled = true;
  } catch (error) {
    console.error("Error during startup:", error);
  }
}
// Fetch JSON data from the provided URL
async function fetchAssetData() {
  const timestamp = new Date().getTime(); // Generate a timestamp
  const url = `https://raw.githubusercontent.com/coinhall/yacar/main/injective/asset.json?timestamp=${timestamp}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching assetData:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
}
function clearAssetForm() {
  const formContainer = document.getElementById("assetForm");
  for (const input of formContainer.getElementsByTagName("input")) {
    input.value = "";
  }

  // Hide the form container
  formContainer.style.display = "none";
  const copyAssetJsonBtn = document.getElementById("copyAssetJsonBtn");
  copyAssetJsonBtn.disabled = false;
}
// Display asset information in the form
function displayAssetForm(asset) {
  const formContainer = document.getElementById("assetForm");
  formContainer.innerHTML = "";

  const assetFields = [
    "id",
    "entity",
    "name",
    "symbol",
    "decimals",
    "type",
    "verification_tx",
    "circ_supply",
    "total_supply",
    "circ_supply_api",
    "total_supply_api",
    "icon",
    "coinmarketcap",
    "coingecko",
  ];

  for (const field of assetFields) {
    const label = document.createElement("label");
    label.innerHTML = `${field}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = asset[field] || ""; // Use an empty string if the field is undefined
    input.id = field;

    formContainer.appendChild(label);
    formContainer.appendChild(input);
  }
}

async function searchAsset() {
    const assetId = document.getElementById("assetId").value;
    const assetData = updatedAssetJson;
  
    const foundAsset = assetData.find((asset) => asset.id === assetId);
  
    const formContainer = document.getElementById("assetForm");
  
    if (foundAsset) {
      displayAssetForm(foundAsset);
      // Show the form container
      formContainer.style.display = "block";
    } else {
      // Asset not found, pre-fill the ID and display an empty form
      displayAssetForm({ id: assetId, name: "", symbol: "", decimals: "", type: "" });
      // Show the form container
      formContainer.style.display = "block";
    }
  
    const copyAssetJsonBtn = document.getElementById("copyAssetJsonBtn");
    copyAssetJsonBtn.disabled = true;
  }
  
  async function updateAsset() {
    const formContainer = document.getElementById("assetForm");
    const updatedAsset = {};
  
    // Validate required fields
    const requiredFields = ["name", "symbol", "decimals", "id", "type"];
    for (const field of requiredFields) {
      const input = document.getElementById(field);
      if (!input.value.trim()) {
        alert(`${field} is required`);
        return;
      }
      updatedAsset[field] = input.value;
    }
  
    for (const input of formContainer.getElementsByTagName("input")) {
      updatedAsset[input.id] = input.value;
    }
  
    try {
      // Fetch the entire assetData array
      let assetData = updatedAssetJson;
  
      // Find the index of the asset to update
      const assetIndex = assetData.findIndex((asset) => asset.id === updatedAsset.id);
  
      if (assetIndex !== -1) {
        // Update the specific entry in the assetData array
        assetData[assetIndex] = { ...assetData[assetIndex], ...updatedAsset };
        updatedAssetJson = assetData;
  
        // Show a popup notification
        alert("Asset Updated!");
      } else {
        alert("Asset not found in the array.");
      }
    } catch (error) {
      console.error("Error fetching or updating assetData:", error);
    }
  
    clearAssetForm();
  }
  

async function fetchEntityData() {
  const response = await fetch(
    "https://raw.githubusercontent.com/coinhall/yacar/main/injective/entity.json"
  );
  const data = await response.json();
  return data;
}

// Display entity information in the form
function displayEntityForm(entity) {
  const formContainer = document.getElementById("assetForm");
  formContainer.innerHTML = "";

  const entityFields = ["name", "website", "telegram", "twitter", "discord"];

  for (const field of entityFields) {
    const label = document.createElement("label");
    label.innerHTML = `${field}:`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = entity[field] || "";
    input.id = field;

    formContainer.appendChild(label);
    formContainer.appendChild(input);
  }
}

async function updateEntityAndAssets() {
  const entityName = document.getElementById("entityName").value;
  const entityData = updatedEntityJson;
  const assetData = updatedAssetJson;

  const updatedEntity = {
    name: entityName,
    website: document.getElementById("entityWebsite").value || undefined,
    telegram: document.getElementById("entityTelegram").value || undefined,
    twitter: document.getElementById("entityTwitter").value || undefined,
    discord: document.getElementById("entityDiscord").value || undefined,
  };

  // Update the entity data
  const existingEntityIndex = entityData.findIndex(
    (entity) => entity.name === entityName
  );

  if (existingEntityIndex !== -1) {
    entityData[existingEntityIndex] = updatedEntity;
  } else {
    entityData.push(updatedEntity);
  }

  // Update corresponding assets if asset IDs are provided
  const assetIdsInput = document.getElementById("assetIds").value;
  const assetIdsArray = assetIdsInput ? assetIdsInput.split(",") : [];

  for (const assetId of assetIdsArray) {
    const existingAssetIndex = assetData.findIndex(
      (asset) => asset.id === assetId
    );

    if (existingAssetIndex !== -1) {
      assetData[existingAssetIndex].entity = entityName;
    }
  }

  updatedEntityJson = entityData;

  updatedAssetJson = assetData;
  navigator.clipboard
    .writeText(updatedEntityJson)
    .then(() =>
      alert(
        "Entity added and entity.json and asset.json are updated! Please copy both of them and do a github pr with the updated info!"
      )
    )
    .catch((err) => console.error("Error copying to clipboard:", err));

  const copyAssetJsonBtn = document.getElementById("copyEntityJsonBtn");
  copyAssetJsonBtn.disabled = false;
}

// Copy entity.json to clipboard
async function copyEntityJson() {
  // Copy to clipboard
  navigator.clipboard
    .writeText(updatedEntityJson)
    .then(() => alert("entity.json copied to clipboard!"))
    .catch((err) => console.error("Error copying to clipboard:", err));
}

// Copy asset.json to clipboard
async function copyAssetJson() {
  // Copy to clipboard
  navigator.clipboard
    .writeText(updatedAssetJson)
    .then(() => alert("asset.json copied to clipboard!"))
    .catch((err) => console.error("Error copying to clipboard:", err));
}

onStartup();
