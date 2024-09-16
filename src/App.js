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
      }
    }
  }
`;

function AddData({ data, setData }) {
  const [addDataFunction, { data: mutatedData, loading, error }] =
    useMutation(ADD_RECORD);
  const [props, setProps] = useState([
    { symptom: "itching", isSelected: false },
    { symptom: "watery_eyes", isSelected: false },
    { symptom: "runny_nose", isSelected: false },
    { symptom: "sneezing", isSelected: false },
    { symptom: "nasal_inflammation", isSelected: false },
    { symptom: "swollen_throat", isSelected: false },
    { symptom: "rash", isSelected: false },
  ]);

  useEffect(() => {
    if (mutatedData?.addRecord?.record.length) {
      let newData = [...data, mutatedData.addRecord.record[0]];
      setData(newData);
    }
  }, [mutatedData]);

  const toggle = (idx) => {
    const updatedProps = props.map((prop, i) =>
      i === idx ? { ...prop, isSelected: !prop.isSelected } : prop
    );
    setProps(updatedProps);
  };

  const addRecord = () => {
    function isMoreThanSixHoursDifference(date1, date2) {
      const moment1 = moment(date1);
      const moment2 = moment(date2);
  
      const hoursDifference = Math.abs(moment.duration(moment2.diff(moment1)).asHours());
      return hoursDifference > 6;
    }
  
    let currentMoment = moment();
    let formattedDate = currentMoment.format("Do MMMM YYYY, h:mm:ss a");
  
    if (
      data.length &&
      !isMoreThanSixHoursDifference(data[data.length - 1].date, currentMoment)
    ) {
      alert("You cannot take medicine in less than 6 hours of your previous dose.");
      return;
    }
  
    const symptoms = props
      .filter((prop) => prop.isSelected)
      .map((prop) => prop.symptom);
  
    addDataFunction({ variables: { date: formattedDate, symptoms } });
  };

  return (
    <div className="form-flex">
      <h2>Select Symptoms</h2>
      <div className="btn-flex">
        {props.map((prop, idx) => (
          <button
            key={idx}
            className={"btn" + (prop.isSelected ? " selected" : "")}
            onClick={() => toggle(idx)}
          >
            {prop.symptom.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <button onClick={addRecord} className="btn btn-process">
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
      const newArr = selectedRecord.filter(
        (r) => !deletedRecord.deleteRecord.record.some((y) => y.id === r)
      );
      setSelected(newArr);

      const updatedRecords = record.filter(
        (x) => !deletedRecord.deleteRecord.record.some((y) => y.id === x.id)
      );
      setRecord(updatedRecords);
    }
  }, [deletedRecord, record, setRecord, selectedRecord, setSelected]);

  const deleteRecord = () => {
    deleteRecordFunction({ variables: { id: selectedRecord } });
  };

  if (loading) return <p className="text-yellow">Deleting...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <button onClick={deleteRecord} className="btn btn-delete">
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
  const toggleRecord = (id) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((x) => x !== id)
        : [...prevSelected, id]
    );
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
              <th>Date</th>
              <th>Symptoms</th>
            </tr>
          </thead>
          <tbody>
            {record.map((record, idx) => (
              <tr key={record.id}>
                <td>
                  <input
                    onChange={() => toggleRecord(record.id)}
                    type="checkbox"
                    checked={select.includes(record.id)}
                  />
                </td>
                <td>{idx + 1}</td>
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
  const [dataRecord, setData] = useState([]);
  const [selectedRecord, setSelected] = useState([]);

  useEffect(() => {
    setData(data?.queryRecord || []);
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
