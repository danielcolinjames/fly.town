export function Heatmap({ checkInsData }) {
  // Define the range of days and hours
  const daysOfWeek = [1, 2, 3, 4, 5, 6, 7]; // 1 = Monday, 7 = Sunday
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  // Find the maximum count to normalize the heatmap intensity
  const maxCount = Math.max(...checkInsData.map(data => data.count));

  // Function to find the count for a specific day and hour
  const getCount = (day, hour) => {
    const entry = checkInsData.find(d => d.dayOfWeek === day && d.hour === hour);
    return entry ? entry.count : 0;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
      {daysOfWeek.map(day =>
        hoursOfDay.map(hour => {
          const count = getCount(day, hour);
          const opacity = count / maxCount; // Normalize count to determine opacity
          return (
            <div
              key={`${day}-${hour}`}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: `rgba(0, 0, 255, ${opacity})`, // Adjust color as needed
                display: 'inline-block',
              }}
              title={`Day ${day}, Hour ${hour}: ${count} check-ins`}
            ></div>
          );
        })
      )}
    </div>
  );
}