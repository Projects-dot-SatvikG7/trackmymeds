import { useQuery, gql, useMutation } from "@apollo/client";
import "./App.css";
import { useState } from "react";
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

function AddData() {
    const [addDataFunction, { data, loading, error }] = useMutation(ADD_RECORD);
    const [props, setProps] = useState([
        ["itching", 0],
        ["watery_eyes", 0],
        ["runny_nose", 0],
        ["sneezing", 0],
        ["nasal_inflammation", 0],
        ["swollen_throat", 0],
    ]);
    const toggle = (idx) => {
        let temp = [...props];
        temp[idx][1] = 1 - temp[idx][1];
        setProps(temp);
    };
    const addRecord = () => {
        let date = new Date().toLocaleString();
        let symptoms = props.filter((prop) => prop[1]).map((prop) => prop[0]);
        console.log(date, symptoms);
        addDataFunction({ variables: { date, symptoms } });
        if (error) console.log(error);
        if (data) {
            console.log(data);
        }
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

function DisplayRecords() {
    const { loading, error, data } = useQuery(GET_RECORDS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div>
            <table id="records">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Symptoms</th>
                    </tr>
                </thead>
                <tbody>
                    {data.queryRecord.map((data) => (
                        <tr key={data.id}>
                            <td>{data.id}</td>
                            <td>{data.date}</td>
                            <td>
                                <ul>
                                    {data.symptom.map((s) => (
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

export default function App() {
    return (
        <div>
            <h1>TrackMyMeds</h1>
            <AddData />
            <DisplayRecords />
        </div>
    );
}
