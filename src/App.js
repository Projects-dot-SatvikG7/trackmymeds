import { useQuery, gql, useMutation } from "@apollo/client";
import "./App.css";
import { useEffect, useState } from "react";
import moment from "moment";

const GET_RECORDS = gql`
  query Records {
    queryRecord {
      id
      date
      symptom
    }
  }
`;

const ADD_RECORD = gql`
  mutation MyMutation($date: String!, $symptoms: [Symptom!]!) {
    addRecord(input: { date: $date, symptom: $symptoms }) {
      record {
        id
        date
        symptom
      }
    }
  }
`;

const DELETE_RECORD = gql`
  mutation MyMutation($id: [ID!]!) {
    deleteRecord(filter: { id: $id }) {
      record {
        id
        date
        symptom
        __typename
      }
    }
  }
`;

function AddData({ data, setData }) {
  const [addDataFunction, { data: mutatedData, loading, error }] =
    useMutation(ADD_RECORD);
  const [props, setProps] = useState([
    ["itching", 0],
    ["watery_eyes", 0],
    ["runny_nose", 0],
    ["sneezing", 0],
    ["nasal_inflammation", 0],
    ["swollen_throat", 0],
  ]);
  useEffect(() => {
    if (mutatedData?.addRecord?.record.length) {
      console.log(data);
      let newData = [...data, mutatedData.addRecord.record[0]];
      setData(newData);
    }
    // eslint-disable-next-line
  }, [mutatedData]);
  const toggle = (idx) => {
    let temp = [...props];
    temp[idx][1] = 1 - temp[idx][1];
    setProps(temp);
  };
  const addRecord = () => {
    function isMoreThanSixHoursDifference(date1, date2) {
      const moment1 = moment(date1);
      const moment2 = moment(date2);

      const difference = moment2.diff(moment1);

      const hoursDifference = Math.abs(moment.duration(difference).asHours());

      return hoursDifference > 6;
    }

    let date = moment().format("Do MMMM YYYY, h:mm:ss a");
    console.log(date);
    console.log(date);
    console.log(date);
    if (
      data.length &&
      !isMoreThanSixHoursDifference(data[data.length - 1].date, date)
    ) {
      alert(
        "You cannot take medicine in less than 6 hours of your previous dose."
      );
      return;
    }
    let symptoms = props.filter((prop) => prop[1]).map((prop) => prop[0]);
    addDataFunction({ variables: { date, symptoms } });
  };
  return (
    <div className="form-flex">
      <h2>Select Symptoms</h2>
      <div className="btn-flex">
        {props.map((prop, idx) => (
          <button
            key={idx}
            className={"btn" + (prop[1] ? " selected" : "")}
            onClick={() => toggle(idx)}
          >
            {prop[0].replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <button onClick={() => addRecord()} className="btn btn-process">
        {loading ? "Recording..." : "Record Dose"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}

function DeleteSelected({ record, setRecord, selectedRecord, setSelected }) {
  const [deleteRecordFunction, { data: deletedRecord, loading, error }] =
    useMutation(DELETE_RECORD);
  useEffect(() => {
    if (deletedRecord?.deleteRecord?.record.length) {
      let newArr = selectedRecord.filter((r) => {
        let bool = true;
        deletedRecord.deleteRecord.record.map((y) => {
          if (y.id === r) {
            bool = false;
          }
          return true;
        });
        return bool;
      });
      setSelected(newArr);

      newArr = record.filter((x) => {
        let bool = true;
        deletedRecord.deleteRecord.record.map((y) => {
          if (y.id === x.id) {
            bool = false;
          }
          return true;
        });
        return bool;
      });
      setRecord(newArr);
    }
  }, [setRecord, record, setSelected, selectedRecord, deletedRecord]);

  const deleteRecord = () => {
    deleteRecordFunction({ variables: { id: selectedRecord } });
  };

  if (loading) return <p className="text-yellow">Deleting...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <button onClick={() => deleteRecord()} className="btn btn-delete">
      Delete Records
    </button>
  );
}

function DisplayRecords({
  loading,
  error,
  record,
  setRecord,
  select,
  setSelected,
}) {
  const toggleRecord = (e, id) => {
    if (e.target.checked) {
      setSelected([...select, id]);
    } else {
      setSelected(select.filter((x) => x !== id));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if (record?.length) {
    return (
      <div id="table-wrapper">
        <table id="records">
          <thead>
            <tr>
              <th>
                {select.length ? (
                  <DeleteSelected
                    record={record}
                    setRecord={setRecord}
                    selectedRecord={select}
                    setSelected={setSelected}
                  />
                ) : (
                  "Select"
                )}
              </th>
              <th>Sr. No.</th>
              {/* <th>ID</th> */}
              <th>Date</th>
              <th>Symptoms</th>
            </tr>
          </thead>
          <tbody>
            {record.map((record, idx) => (
              <tr key={record.id}>
                <td>
                  <input
                    onChange={(e) => toggleRecord(e, record.id)}
                    type="checkbox"
                  ></input>
                </td>
                <td>{idx + 1}</td>
                {/* <td>{record.id}</td> */}
                <td>{record.date}</td>
                <td>
                  <ul>
                    {record.symptom.map((s) => (
                      <li key={s}>{s.replaceAll("_", " ")}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <h1>Start Recording Data</h1>;
}

export default function App() {
  const { loading, error, data } = useQuery(GET_RECORDS);
  const [dataRecord, setData] = useState(data);
  const [selectedRecord, setSelected] = useState([]);

  useEffect(() => {
    setData(data?.queryRecord);
  }, [data]);
  return (
    <div>
      <h1>TrackMyMeds</h1>
      <AddData data={dataRecord} setData={setData} />
      <DisplayRecords
        loading={loading}
        error={error}
        record={dataRecord}
        setRecord={setData}
        select={selectedRecord}
        setSelected={setSelected}
      />
    </div>
  );
}
