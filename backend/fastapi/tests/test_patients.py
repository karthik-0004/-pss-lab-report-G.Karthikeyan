def test_create_patient_success(client, sample_patient_payload):
    response = client.post("/api/patients", json=sample_patient_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["patient_id"].startswith("PSS-")
    assert data["name"] == "John Doe"
    assert data["age"] == 35


def test_create_patient_auto_generates_patient_id(client, sample_patient_payload):
    first_response = client.post("/api/patients", json=sample_patient_payload)

    second_payload = {
        "name": "Jane Roe",
        "age": 29,
        "gender": "Female",
        "contact_number": "9999999999",
    }
    second_response = client.post("/api/patients", json=second_payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_patient_id = first_response.json()["patient_id"]
    second_patient_id = second_response.json()["patient_id"]

    assert first_patient_id != second_patient_id
    assert first_patient_id.startswith("PSS-")
    assert second_patient_id.startswith("PSS-")


def test_get_all_patients_empty(client):
    response = client.get("/api/patients")

    assert response.status_code == 200
    assert response.json() == []


def test_get_all_patients_returns_created_patients(client, sample_patient_payload):
    client.post("/api/patients", json=sample_patient_payload)
    client.post(
        "/api/patients",
        json={
            "name": "Alice Smith",
            "age": 31,
            "gender": "Female",
            "contact_number": "1234567890",
        },
    )
    client.post(
        "/api/patients",
        json={
            "name": "Bob Jones",
            "age": 45,
            "gender": "Male",
            "contact_number": "4561237890",
        },
    )

    response = client.get("/api/patients")

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_get_patient_by_id_success(client, sample_patient_payload):
    create_response = client.post("/api/patients", json=sample_patient_payload)
    patient_id = create_response.json()["patient_id"]

    response = client.get(f"/api/patients/{patient_id}")

    assert response.status_code == 200
    data = response.json()
    assert "patient" in data
    assert "reports" in data
    assert data["patient"]["name"] == "John Doe"


def test_get_patient_by_id_not_found(client):
    response = client.get("/api/patients/PSS-9999")

    assert response.status_code == 404


def test_update_patient_success(client, sample_patient_payload):
    create_response = client.post("/api/patients", json=sample_patient_payload)
    patient_id = create_response.json()["patient_id"]

    update_payload = {
        "name": "Jane Doe",
        "age": 28,
        "gender": "Female",
        "contact_number": "9876500000",
    }
    response = client.put(f"/api/patients/{patient_id}", json=update_payload)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["age"] == 28


def test_delete_patient_success(client, sample_patient_payload):
    create_response = client.post("/api/patients", json=sample_patient_payload)
    patient_id = create_response.json()["patient_id"]

    delete_response = client.delete(f"/api/patients/{patient_id}")
    fetch_response = client.get(f"/api/patients/{patient_id}")

    assert delete_response.status_code == 200
    assert fetch_response.status_code == 404


def test_search_patients_by_name(client):
    client.post(
        "/api/patients",
        json={
            "name": "Alice Smith",
            "age": 31,
            "gender": "Female",
            "contact_number": "1111111111",
        },
    )
    client.post(
        "/api/patients",
        json={
            "name": "Bob Jones",
            "age": 42,
            "gender": "Male",
            "contact_number": "2222222222",
        },
    )

    response = client.get("/api/patients", params={"search": "Alice"})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alice Smith"
