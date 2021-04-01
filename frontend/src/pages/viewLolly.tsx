import React, { useEffect, useState } from "react";
import LollyTemplate from "../components/LollyTemplate";
import { Spinner } from "theme-ui";
import { API } from 'aws-amplify';
import { getLollyById } from "../graphql/queries";
import { navigate } from "gatsby-link";

export default (props) => {
  const refId = props.location.search;
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>()

  const fetchTodoByID = async () => {
    const response: any = await API.graphql({
      query: getLollyById,
      variables: {
        id: `${refId.slice(4)}`
      }
    })
    return response;
  }

  useEffect(() => {
    fetchTodoByID().then((data) => {
      // console.log("data from useeffect==.", data);
      if (data.data.getLollyById.length === 0)
        navigate("/404")
      setData(data.data.getLollyById[0])
      setLoading(false);
    });
  }, [])

  if (loading && data !== undefined)
    return (
      <div style={{ textAlign: "center" }}>
        <Spinner />
      </div>
    );

  return (
    <>
      {data ? (<LollyTemplate
        pageContext={{ ...data }}
      />) : null}

    </>
  );
};
