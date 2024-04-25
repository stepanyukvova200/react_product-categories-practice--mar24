/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

function getCategoryById(categoryId) {
  return (
    categoriesFromServer.find(category => category.id === categoryId) || null
  );
}

function getUserById(userId) {
  return usersFromServer.find(user => user.id === userId) || null;
}

const products = productsFromServer.map(product => ({
  ...product,
  category: getCategoryById(product.categoryId),
  user: getUserById(getCategoryById(product.categoryId).ownerId),
}));

const CRITERIA_OF_SORT = ['ID', 'Product', 'Category', 'User'];
const AVAILABLE_ORDER_TO_SORT = ['', 'asc', 'desc'];

const handleSortClick = (
  criterion,
  sortBy,
  setSortBy,
  sortingOrder,
  setSortingOrder,
) => {
  if (sortBy !== criterion) {
    setSortBy(criterion);
    setSortingOrder(AVAILABLE_ORDER_TO_SORT[1]);
  } else {
    const currentOrderIndex =
      AVAILABLE_ORDER_TO_SORT.findIndex(order => {
        return order === sortingOrder;
      }) + 1;

    setSortingOrder(
      AVAILABLE_ORDER_TO_SORT[
        currentOrderIndex % AVAILABLE_ORDER_TO_SORT.length
      ],
    );
    if (currentOrderIndex === 3) {
      setSortBy('');
    }
  }
};

export const App = () => {
  const [selectedUser, setSelectedUser] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortingOrder, setSortingOrder] = useState('');

  const productToSort = [...products];

  const sortedProducts = productToSort.sort((product1, product2) => {
    switch (sortBy) {
      case 'ID':
        return product1.id - product2.id;
      case 'Product':
        return product1.name.localeCompare(product2.name);
      case 'Category':
        return product1.category.title.localeCompare(product2.category.title);
      case 'User':
        return product1.user.name.localeCompare(product2.user.name);
      default:
        return 0;
    }
  });

  if (sortingOrder === AVAILABLE_ORDER_TO_SORT[2]) {
    sortedProducts.reverse();
  }

  const correctProducts = sortedProducts.filter(product => {
    const isCorrectUser =
      selectedUser === product.user.name || selectedUser === 'All';
    const isCorrectCategory =
      selectedCategory.includes(product.category.title) ||
      selectedCategory.length === 0;
    const isCorrectQuery = product.name
      .toLowerCase()
      .includes(query.trim().toLowerCase());

    return isCorrectUser && isCorrectCategory && isCorrectQuery;
  });

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': selectedUser === 'All' })}
                onClick={() => setSelectedUser('All')}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={cn({ 'is-active': user.name === selectedUser })}
                  onClick={() => setSelectedUser(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.currentTarget.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query !== '' && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategory.length !== 0,
                })}
                onClick={() => setSelectedCategory([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategory.includes(category.title),
                  })}
                  href="#/"
                  key={category.id}
                  onClick={() => {
                    if (!selectedCategory.includes(category.title)) {
                      setSelectedCategory([
                        ...selectedCategory,
                        category.title,
                      ]);
                    } else {
                      setSelectedCategory(
                        selectedCategory.filter(
                          currentCategory => currentCategory !== category.title,
                        ),
                      );
                    }
                  }}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setSelectedUser('All');
                  setSelectedCategory([]);
                  setQuery('');
                  setSortBy('');
                  setSortingOrder('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {correctProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {CRITERIA_OF_SORT.map(criterion => (
                    <th key={criterion}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {criterion}

                        <a
                          href="#/"
                          onClick={() =>
                            handleSortClick(
                              criterion,
                              sortBy,
                              setSortBy,
                              sortingOrder,
                              setSortingOrder,
                            )
                          }
                        >
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortBy !== criterion,
                                'fa-sort-up':
                                  sortingOrder === AVAILABLE_ORDER_TO_SORT[1] &&
                                  sortBy === criterion,
                                'fa-sort-down':
                                  sortingOrder === AVAILABLE_ORDER_TO_SORT[2] &&
                                  sortBy === criterion,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {correctProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
