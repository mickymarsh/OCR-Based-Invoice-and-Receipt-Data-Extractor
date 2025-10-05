# pytest/conftest.py

def pytest_itemcollected(item):
    """Show docstring when test is collected"""
    if item.function.__doc__:
        item._nodeid = f"{item.nodeid} - {item.function.__doc__}"
