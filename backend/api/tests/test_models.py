import pytest
from api.models import Product

@pytest.mark.django_db
def test_product_str_representation():
    product = Product.objects.create(name="Test Camera", price=199.99)
    product_str = str(product)
    assert product_str == "Test Camera"