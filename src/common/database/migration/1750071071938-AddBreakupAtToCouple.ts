import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBreakupAtToCouple1750071071938 implements MigrationInterface {
  name = 'AddBreakupAtToCouple1750071071938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'couple',
      new TableColumn({
        name: 'breakupAt',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
        UPDATE couple
        SET breakupAt = DATE_ADD(DATE(createdAt), INTERVAL breakupBufferPoint DAY)
        WHERE breakupAt IS NULL
    `);

    await queryRunner.dropColumn('couple', 'breakupBufferPoint');

    await queryRunner.changeColumn(
      'couple',
      'breakupAt',
      new TableColumn({
        name: 'breakupAt',
        type: 'date',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'couple',
      'breakupAt',
      new TableColumn({
        name: 'breakupAt',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'couple',
      new TableColumn({
        name: 'breakupBufferPoint',
        type: 'int',
        unsigned: true,
        default: 14,
        isNullable: false,
      }),
    );

    await queryRunner.dropColumn('couple', 'breakupAt');
  }
}
