from app.services.report_service import compute_status


def _create_patient(client, name: str = "John Doe") -> dict:
    response = client.post(
        "/api/patients",
        json={
            "name": name,
            "age": 35,
            "gender": "Male",
            "contact_number": "9876543210",
        },
    )
    assert response.status_code == 201
    return response.json()


def _create_report(
    client,
    patient_id: str,
    result_value: float,
    reference_min: float = 70.0,
    reference_max: float = 110.0,
):
    return client.post(
        f"/api/reports/{patient_id}",
        data={
            "report_type": "Blood Test",
            "report_date": "2025-01-15",
            "result_value": str(result_value),
            "unit": "mg/dL",
            "reference_min": str(reference_min),
            "reference_max": str(reference_max),
        },
    )


def test_create_report_normal_status(client):
    patient = _create_patient(client)

    response = _create_report(client, patient["patient_id"], result_value=90.0)

    assert response.status_code == 201
    assert response.json()["status"] == "Normal"


def test_create_report_abnormal_status_high(client):
    patient = _create_patient(client)

    response = _create_report(client, patient["patient_id"], result_value=150.0)

    assert response.status_code == 201
    assert response.json()["status"] == "Abnormal"


def test_create_report_abnormal_status_low(client):
    patient = _create_patient(client)

    response = _create_report(client, patient["patient_id"], result_value=50.0)

    assert response.status_code == 201
    assert response.json()["status"] == "Abnormal"


def test_compute_status_pure_function():
    assert compute_status(90.0, 70.0, 110.0) == "Normal"
    assert compute_status(150.0, 70.0, 110.0) == "Abnormal"
    assert compute_status(50.0, 70.0, 110.0) == "Abnormal"


def test_get_dashboard_stats_empty(client):
    response = client.get("/api/reports/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert data["total_patients"] == 0
    assert data["total_reports"] == 0
    assert data["abnormal_reports"] == 0


def test_get_dashboard_stats_with_data(client):
    patient_1 = _create_patient(client, name="Alice Smith")
    patient_2 = _create_patient(client, name="Bob Jones")

    response_1 = _create_report(client, patient_1["patient_id"], result_value=90.0)
    response_2 = _create_report(client, patient_1["patient_id"], result_value=95.0)
    response_3 = _create_report(client, patient_2["patient_id"], result_value=150.0)

    assert response_1.status_code == 201
    assert response_2.status_code == 201
    assert response_3.status_code == 201

    dashboard_response = client.get("/api/reports/dashboard")

    assert dashboard_response.status_code == 200
    data = dashboard_response.json()
    assert data["total_patients"] == 2
    assert data["total_reports"] == 3
    assert data["abnormal_reports"] == 1
    assert len(data["recent_reports"]) == 3


def test_delete_report_success(client):
    patient = _create_patient(client)
    create_report_response = _create_report(client, patient["patient_id"], result_value=90.0)
    report_id = create_report_response.json()["id"]

    delete_response = client.delete(f"/api/reports/{report_id}")
    get_response = client.get(f"/api/reports/{report_id}")

    assert delete_response.status_code == 200
    assert get_response.status_code == 404


def test_update_report_recomputes_status(client):
    patient = _create_patient(client)
    create_report_response = _create_report(client, patient["patient_id"], result_value=90.0)
    report_id = create_report_response.json()["id"]

    update_response = client.put(
        f"/api/reports/{report_id}",
        data={
            "report_type": "Blood Test",
            "report_date": "2025-01-16",
            "result_value": "150.0",
            "unit": "mg/dL",
            "reference_min": "70.0",
            "reference_max": "110.0",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Abnormal"
