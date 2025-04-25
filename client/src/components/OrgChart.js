import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const OrgChart = ({ data }) => {
  const ref = useRef();
  useEffect(() => {
    // TODO: Render org chart using d3
  }, [data]);
  return <svg ref={ref} width={600} height={400}></svg>;
};

export default OrgChart;
