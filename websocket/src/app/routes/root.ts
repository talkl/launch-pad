import { FastifyInstance } from 'fastify';
import { prisma } from '@launch-pad/rdb';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    const patients = await prisma.patient.findMany();
    console.log(patients);
    return { message: 'Hello API' };
  });
}
