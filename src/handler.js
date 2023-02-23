/* eslint-disable prefer-destructuring */
/* eslint-disable padded-blocks */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable consistent-return */
const { nanoid } = require('nanoid');

const books = require('./bookshelf');

const addBookHandler = (req, h) => {
    const {
        name, year, author, summary, publisher, pageCount, readPage, finished, reading,
    } = req.payload;

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt
    };
    books.push(newBook);
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        response.code(201);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku'
    });
    response.code(500);
    return response;
};

const getAllBooksHandler = (req, h) => {
    const response = h.response({
        status: 'success',
        data: {
            books: books.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    });
    response.code(200);
    return response;
};

const getBookByIdHandler = (req, h) => {
    const { id } = req.params;

    const book = books.filter((n) => n.id === id)[0];
    if (book !== undefined) {
        const response = h.response({
            status: 'success',
            data: {
                book
            }
        });
        response.code(200);
        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan'
    });
    response.code(404);
    return response;
};

module.exports = {
    addBookHandler,
    getBookByIdHandler,
    getAllBooksHandler
};
