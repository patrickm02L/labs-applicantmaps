export default function(server) {
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  server.loadFixtures('projects');
  server.createList('layer-group', 3);
}
