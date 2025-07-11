import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_product_list_api_view_unauthenticated():
    client = APIClient()
    response = client.get('/api/products/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_order_list_view_unauthenticated():
    client = APIClient()
    response = client.get('/api/orders/')
    assert response.status_code == 401


