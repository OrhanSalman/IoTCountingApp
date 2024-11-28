import React, { useState, useContext } from "react";
import { Row } from "antd";
import { useUpdateHandler } from "./hooks/updateHandler";
import CardWithTree from "./components/CardWithTree";
import { categories } from "../../../../src/constants/constants";
import { DeviceContext } from "../../../api/DeviceContext";

const SectionTags = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [onlyUrban, setOnlyUrban] = useState(true);
  const { handleSelectedTagsChange } = useUpdateHandler();
  const { data } = useContext(DeviceContext);
  const deviceTags = data.deviceTags || [];

  const treeData = categories
    .filter((category) => !onlyUrban || category.isUrban)
    .map((category) => ({
      title: category.category,
      value: category.category,
      key: category.category,
      selectable: false,
      children: category.items.map((item) => ({
        title: item.label,
        value: item.value,
        key: item.value,
        selectable: true,
      })),
    }));

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setOnlyUrban(isChecked);
    if (isChecked) {
      const onlyUrbanItems = categories
        .filter((cat) => cat.isUrban)
        .reduce(
          (acc, cat) => [...acc, ...cat.items.map((item) => item.value)],
          []
        );

      const filteredCategories = selectedCategories.filter((cat) =>
        onlyUrbanItems.includes(cat)
      );
      setSelectedCategories(filteredCategories);
    }
  };

  const cardItemsTree = [
    {
      title: "Kategorien",
      value: deviceTags[0]?.tags || [],
      tooltip:
        "Bestimmt, welche Objektklassen erkannt werden sollen. Wird auf alle Konfigurationen angewendet.",
      width: "100%",
      checkbox: {
        label: "Nur urbane Kategorien",
        value: onlyUrban,
        onChange: handleCheckboxChange,
      },
    },
  ];

  return (
    <>
      <Row>
        {cardItemsTree.map((item, index) => (
          <CardWithTree
            key={index}
            item={item}
            width={item.width}
            height={item.height}
            treeData={treeData}
            handleSelectedTagsChange={handleSelectedTagsChange}
          />
        ))}
      </Row>
    </>
  );
};

export default SectionTags;
