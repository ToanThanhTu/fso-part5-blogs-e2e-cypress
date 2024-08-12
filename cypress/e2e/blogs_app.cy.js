describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)

    const user = {
      name: 'John Smith',
      username: 'john',
      password: 'smith'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)

    cy.visit('')
  })

  it('front page opened to log in page', function () {
    cy.contains('log in to application')
    cy.contains('username')
    cy.contains('password')
  })

  it('user can log in', function () {
    cy.get('#username').type('john')
    cy.get('#password').type('smith')
    cy.get('#login-button').click()

    cy.contains('John Smith logged in')
  })

  it('login fails with wrong password', function () {
    cy.get('#username').type('john')
    cy.get('#password').type('wrong')
    cy.get('#login-button').click()

    cy.contains('wrong username or password')
    cy.get('.error')
      .contains('wrong username or password')
      .should('contain', 'wrong username or password')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-style', 'solid')

    cy.get('html').should('not.contain', 'John Smith logged in')
    cy.contains('John Smith logged in').should('not.exist')
  })

  describe('when logged in', function () {
    beforeEach(function () {
      cy.login({ username: 'john', password: 'smith' })
    })

    it('a new blog can be created', function () {
      cy.contains('create new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('Jack Daniels')
      cy.get('#url').type('https://fakeurl.com')
      cy.get('.create-button').click()
      cy.contains('a blog created by cypress')
    })

    describe('and a blog exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'a blog created by cypress',
          author: 'Kang Liam',
          url: 'https://anotherfake.url'
        })
      })

      it('it can be liked', function () {
        cy.contains('view').click()
        cy.contains('like').click()
        cy.contains('like').click()

        cy.contains('likes 2')
      })
    })

    describe('and several blogs exist', function () {
      beforeEach(function () {
        cy.login({ username: 'john', password: 'smith' })
        cy.createBlog({
          title: 'First Blog by Cypress',
          author: 'John Cy',
          url: 'https://fist.blog.john'
        })
        cy.createBlog({
          title: 'Second Blog by Cypress',
          author: 'Cy Smith',
          url: 'https://second.blog.john'
        })
        cy.createBlog({
          title: 'Third Blog by Cypress',
          author: 'Smith Press',
          url: 'https://third.blog.john'
        })
      })

      it('one of those can be liked', function () {
        // find and click view to expand the second blog
        cy.contains('Second Blog by Cypress')
          .contains('view')
          .click()

        // find the like button and save it with 'as'
        cy.contains('Second Blog by Cypress')
          .contains('like')
          .as('likeButton')
        
        // click like twice
        cy.get('@likeButton').click()
        cy.get('@likeButton').click()

        cy.contains('Second Blog by Cypress')
          .contains('likes 2')
      })
    })
  })
})