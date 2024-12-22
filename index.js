const express = require("express");
const morgan = require('morgan')
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5001;

app.use(morgan('combined'))

// Path to the JSON file
const dbPath = path.join(__dirname, "db.json");

// Path to React build folder
const reactBuildPath = path.join(__dirname, "app", "build");

// Middleware to parse JSON bodies
app.use(express.json());

// Serve React app static files
app.use(express.static(reactBuildPath));

// Utility function to read the database
const readDB = () => {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Utility function to write to the database
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Get all activities
app.get("/api/activities", (req, res) => {
  const db = readDB();
  res.json(db.activities);
});

// Get a single activity by ID
app.get("/api/activities/:name", (req, res) => {
  const db = readDB();
  const activity = db.activities.find((a) => a.name === req.params.name);
  if (activity) {
    res.json(activity);
  } else {
    res.status(404).json({ error: "Activity not found" });
  }
});

// Add a new activity
app.post("/api/activities", (req, res) => {
  const db = readDB();
  const newActivity = {
    name: req.body.name,
    performedTimes: req.body.performedTimes || [],
  };
  db.activities.push(newActivity);
  writeDB(db);
  res.status(201).json(newActivity);
});

// Update an activity by ID
app.put("/api/activities/:name", (req, res) => {
  const db = readDB();
  const activityIndex = db.activities.findIndex(
    (a) => a.name === req.params.name
  );
  if (activityIndex !== -1) {
    db.activities[activityIndex] = {
      ...db.activities[activityIndex],
      ...req.body,
    };
    writeDB(db);
    res.json(db.activities[activityIndex]);
  } else {
    res.status(404).json({ error: "Activity not found" });
  }
});

// Delete an activity by ID
app.delete("/api/activities/:name", (req, res) => {
  const db = readDB();
  const updatedActivities = db.activities.filter(
    (a) => a.name !== req.params.name
  );
  if (updatedActivities.length !== db.activities.length) {
    db.activities = updatedActivities;
    writeDB(db);
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Activity not found" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuildPath, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});