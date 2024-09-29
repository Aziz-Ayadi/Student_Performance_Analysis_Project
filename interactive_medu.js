// Load the data and render the initial chart
d3.csv('data/processed_file.csv')
  .then(data => {
    // Save the data to a global variable
    window.data = data;

    // Render the initial chart
    const initialColumn = 'Medu';
    updateChart_M(initialColumn);
  })
  .catch(error => {
    console.error('Error loading data:', error);
  });

// Function to update the bar chart based on the selected column
function updateChart_M(column) {
  // Remove the previous bar chart, if exists
  d3.select('#interactiveBar_M').selectAll('*').remove();

  // Extract the required data for the bar chart
  const MeduCountsSucceed = {};
  const MeduCountsFail = {};
  window.data.forEach(row => {
    const Medu = row[column];
    const success = row.success === 'succeed' ? 1 : 0;
    if (success) {
      MeduCountsSucceed[Medu] = (MeduCountsSucceed[Medu] || 0) + 1;
    } else {
      MeduCountsFail[Medu] = (MeduCountsFail[Medu] || 0) + 1;
    }
  });

  const Medus = Object.keys(MeduCountsSucceed);
  const countsSucceed = Medus.map(Medu => MeduCountsSucceed[Medu]);
  const countsFail = Medus.map(Medu => MeduCountsFail[Medu]);

  // Define the dimensions and margins for the bar chart
  const width = 600;
  const height = 400;
  const margin = { top: 50, right: 50, bottom: 70, left: 70 };

  // Create the bar chart SVG container
  const svg = d3.select('#interactiveBar_M')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create x-scale and y-scale for the bar chart
  const xScale = d3.scaleBand()
    .domain(Medus)
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max([...countsSucceed, ...countsFail])])
    .range([height, 0]);

  // Create x-axis and y-axis for the bar chart
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Add x-axis to the bar chart
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom / 2 + 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Medu Level');

  // Add y-axis indicator
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left / 2 - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Number of students');

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', 'rotate(-45)')
    .attr('dx', '-0.8em')
    .attr('dy', '0.15em');

  // Add y-axis to the bar chart
  svg.append('g')
    .call(yAxis);

  // Define colors for bars
  const colorSucceed = '#1f77b4';
  const colorFail = '#ff7f0e';

  // Create bars for the 'success = 1' data
  const barsSucceed = svg.selectAll('.bar-succeed_M')
    .data(Medus)
    .enter()
    .append('rect')
    .attr('class', 'bar-succeed_M')
    .attr('x', d => xScale(d))
    .attr('y', height)
    .attr('width', xScale.bandwidth() / 2)
    .attr('height', 0)
    .attr('fill', colorSucceed)
    .attr('rx', 6)
    .attr('ry', 6)
    .on('mouseover', function(event, d) {
      // Change color and show tooltip on hover
      d3.select(this).attr('fill', 'orange');
      tooltip.style('opacity', 1).html(`Medu Level: ${d} <br> Succeed: ${MeduCountsSucceed[d]}`);
    })
    .on('mousemove', function(event) {
      // Move tooltip with mouse
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 15) + 'px');
    })
    .on('mouseout', function() {
      // Restore color and hide tooltip on mouseout
      d3.select(this).attr('fill', colorSucceed);
      tooltip.style('opacity', 0);
    });

  // Create bars for the 'success = 0' data
  const barsFail = svg.selectAll('.bar-fail_M')
    .data(Medus)
    .enter()
    .append('rect')
    .attr('class', 'bar-fail_M')
    .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
    .attr('y', height)
    .attr('width', xScale.bandwidth() / 2)
    .attr('height', 0)
    .attr('fill', colorFail)
    .attr('rx', 6)
    .attr('ry', 6)
    .on('mouseover', function(event, d) {
      // Change color and show tooltip on hover
      d3.select(this).attr('fill', 'orange');
      tooltip.style('opacity', 1).html(`Medu Level: ${d} <br> Fail: ${MeduCountsFail[d]}`);
    })
    .on('mousemove', function(event) {
      // Move tooltip with mouse
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 15) + 'px');
    })
    .on('mouseout', function() {
      // Restore color and hide tooltip on mouseout
      d3.select(this).attr('fill', colorFail);
      tooltip.style('opacity', 0);
    });

  // Add animation to the bars
  barsSucceed.transition()
    .duration(800)
    .delay((d, i) => i * 50)
    .attr('y', d => yScale(MeduCountsSucceed[d]))
    .attr('height', d => height - yScale(MeduCountsSucceed[d]));

  barsFail.transition()
    .duration(800)
    .delay((d, i) => i * 50)
    .attr('y', d => yScale(MeduCountsFail[d]))
    .attr('height', d => height - yScale(MeduCountsFail[d]));

  // Add tooltips
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '5px')
    .style('border', '1px solid #ddd')
    .style('border-radius', '5px')
    .style('pointer-events', 'none')
    .style('opacity', 0);
}
