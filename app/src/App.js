import React, { useState, useEffect } from "react";

const App = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch activities from the server
  useEffect(() => {
    fetch("/api/activities")
      .then((response) => response.json())
      .then((data) => {
        setActivities(
          data.sort(
            (b, a) =>
              new Date(b.performedTimes[0]) -
              new Date(a.performedTimes[0])
          )
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activities:", error);
        setLoading(false);
      });
  }, []);

  // Handle clicking on an activity to mark it as performed
  const handleActivityClick = (name) => {
    const now = new Date().toISOString();
    fetch(`/api/activities/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        performedTimes: [now, ...activities.find((activity) => activity.name === name).performedTimes],
      }),
    })
      .then((response) => response.json())
      .then((updatedActivity) => {
        const updatedActivities = activities.map((activity) =>
          activity.name === name ? updatedActivity : activity
        );
        setActivities(
          updatedActivities.sort(
            (b, a) =>
              new Date(b.performedTimes[0]) -
              new Date(a.performedTimes[0])
          )
        );
      })
      .catch((error) => {
        console.error("Error updating activity:", error);
      });
  };

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>Activity Tracker</h1>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {activities.map((activity) => (
          <li
            key={activity.name}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
            onClick={() => handleActivityClick(activity.name)}
          >
            <strong>{activity.name}</strong>
            <br />
            <strong>Last performed:</strong>{" "}
            {new Date(
              activity.performedTimes[0]
            ).toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            <br />
            <strong>All Times:</strong>
            <ul>
              {activity.performedTimes.map((time, index) => (
                <li key={index}>
                  {new Date(time).toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;