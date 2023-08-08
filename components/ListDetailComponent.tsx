import React from "react";
import { Text, View } from "react-native";
import { useGlobal } from "../context/GlobalContext";

export const ListDetailComponent: React.FC = () => {
  const { globalValue } = useGlobal();
  const data = ["latitude", "longitude", "city", "country"];

  return (
    <>
      {data.map((item) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 15,
            backgroundColor: "#ecedee",
            borderRadius: 10,
            width: "100%",
          }}
        >
          <Text style={{ color: "#151717", fontSize: 15 }}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Text>
          <Text style={{ color: "#151717", fontSize: 15 }}>
            {globalValue[item]}
          </Text>
        </View>
      ))}
    </>
  );
};
