// staticFunctions.js

export const processCounts = (counts) => {
  const dataSource = [];

  for (const roiName in counts) {
    const roiData = counts[roiName];
    const regions = Object.keys(roiData);
    const classesSet = new Set();
    let inCount = 0;
    let outCount = 0;

    regions.forEach((region) => {
      const { IN, OUT } = roiData[region];

      for (const klass in IN) {
        classesSet.add(klass);
        inCount += IN[klass];
      }

      for (const klass in OUT) {
        classesSet.add(klass);
        outCount += OUT[klass];
      }
    });

    const classesCount = classesSet.size;

    dataSource.push({
      key: roiName, // Eindeutiger Key für die Hauptzeile
      region: roiName,
      classesCount,
      inCount,
      outCount,
    });
  }

  return dataSource;
};

export const getExpandedRowData = (roiName, counts) /*  */ => {
  const expandedData = {};
  const roiData = counts[roiName];

  for (const region in roiData) {
    const { IN, OUT } = roiData[region];

    if (!expandedData[region]) {
      expandedData[region] = {};
    }

    for (const klass in IN) {
      if (!expandedData[region][klass]) {
        expandedData[region][klass] = { inCount: 0, outCount: 0 };
      }
      expandedData[region][klass].inCount += IN[klass];
    }

    for (const klass in OUT) {
      if (!expandedData[region][klass]) {
        expandedData[region][klass] = { inCount: 0, outCount: 0 };
      }
      expandedData[region][klass].outCount += OUT[klass];
    }
  }

  const formattedData = [];
  for (const region in expandedData) {
    for (const klass in expandedData[region]) {
      formattedData.push({
        key: `${region}-${klass}`, // Eindeutiger Key für jede Zeile
        direction: region,
        class: klass,
        inCount: expandedData[region][klass].inCount,
        outCount: expandedData[region][klass].outCount,
      });
    }
  }

  return formattedData;
};
