import FieldKeyNew from '../../../src/components/field-key/new.vue';
import testData from '../../data';
import { mockHttp, mockRoute } from '../../http';
import { mockLogin } from '../../session';
import { mountAndMark } from '../../destroy';
import { submitForm, trigger } from '../../event';

describe('FieldKeyNew', () => {
  beforeEach(mockLogin);

  it('does not render the create button if the project is archived', () =>
    mockRoute('/projects/1/app-users')
      .respondWithData(() => testData.extendedProjects
        .createPast(1, { archived: true, appUsers: 1 })
        .last())
      .respondWithData(() =>
        testData.extendedFieldKeys.createPast(1).sorted())
      .afterResponses(app => {
        app.find('.heading-with-button button').length.should.equal(0);
      }));

  describe('modal', () => {
    it('is initially hidden', () =>
      mockRoute('/projects/1/app-users')
        .respondWithData(() =>
          testData.extendedProjects.createPast(1, { appUsers: 1 }).last())
        .respondWithData(() => testData.extendedFieldKeys.createPast(1).sorted())
        .afterResponses(app => {
          app.first(FieldKeyNew).getProp('state').should.be.false();
        }));

    describe('after button click', () => {
      it('modal is shown', () =>
        mockRoute('/projects/1/app-users')
          .respondWithData(() =>
            testData.extendedProjects.createPast(1, { appUsers: 1 }).last())
          .respondWithData(() => testData.extendedFieldKeys.createPast(1).sorted())
          .afterResponses(app =>
            trigger.click(app, '.heading-with-button button'))
          .then(app => {
            app.first(FieldKeyNew).getProp('state').should.be.true();
          }));

      it('focuses the nickname input', () =>
        mockRoute('/projects/1/app-users', { attachToDocument: true })
          .respondWithData(() =>
            testData.extendedProjects.createPast(1, { appUsers: 1 }).last())
          .respondWithData(() => testData.extendedFieldKeys.createPast(1).sorted())
          .afterResponses(app =>
            trigger.click(app, '.heading-with-button button'))
          .then(app => {
            app.first('#field-key-new input').should.be.focused();
          }));
    });
  });

  it('includes the project name in the first option of the access field', () => {
    const project = testData.extendedProjects.createPast(1).last();
    const modal = mountAndMark(FieldKeyNew, {
      propsData: { projectId: project.id.toString(), state: false },
      requestData: { project }
    });
    const text = modal.first('option').text().trim().iTrim();
    text.should.equal(`${project.name} Forms`);
  });

  it('standard button thinking things', () =>
    mockHttp()
      .mount(FieldKeyNew, {
        propsData: { projectId: '1', state: false },
        requestData: { project: testData.extendedProjects.createPast(1).last() }
      })
      .request(modal => submitForm(modal, 'form', [
        ['input', testData.extendedFieldKeys.createNew().displayName]
      ]))
      .standardButton());

  describe('after successful submit', () => {
    let app;
    beforeEach(() => mockRoute('/projects/1/app-users', { attachToDocument: true })
      .respondWithData(() =>
        testData.extendedProjects.createPast(1, { appUsers: 1 }).last())
      .respondWithData(() => testData.extendedFieldKeys.createPast(1).sorted())
      .afterResponses(component => {
        app = component;
      })
      .request(() => trigger.click(app, '.heading-with-button button')
        .then(() => submitForm(app, '#field-key-new form', [
          ['input', testData.extendedFieldKeys.createNew().displayName]
        ])))
      .respondWithData(() => testData.simpleFieldKeys.last()));

    const testCreationCompletion = () => {
      it('hides the modal', () => {
        app.first(FieldKeyNew).getProp('state').should.be.false();
      });

      it('updates the number of rows in the table', () => {
        app.find('#field-key-list-table tbody tr').length.should.equal(2);
      });

      it('shows a success message', () => {
        app.should.alert('success');
      });
    };
    describe('after the done button is clicked', () => {
      beforeEach(() => mockHttp()
        .request(() => trigger.click(app.first('#field-key-new .btn-primary')))
        .respondWithData(() => testData.extendedFieldKeys.sorted()));

      testCreationCompletion();
    });

    describe('after the "create another" button is clicked', () => {
      beforeEach(() => trigger.click(app.first('#field-key-new .btn-link')));

      it('does not hide the modal', () => {
        app.first(FieldKeyNew).getProp('state').should.be.true();
      });

      it('shows a blank nickname input', () => {
        app.first('#field-key-new input').element.value.should.be.empty();
      });

      it('focuses the nickname input', () => {
        app.first('#field-key-new input').should.be.focused();
      });

      describe('after the close button is clicked', () => {
        beforeEach(() => mockHttp()
          .request(() => trigger.click(app.first('#field-key-new .btn-link')))
          .respondWithData(() => testData.extendedFieldKeys.sorted()));

        testCreationCompletion();
      });
    });
  });
});
