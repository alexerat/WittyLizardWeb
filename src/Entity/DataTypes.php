<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * DataTypes
 *
 * @ORM\Table(name="Aux_Data.Data_Types")
 * @ORM\Entity
 */
class DataTypes
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Type_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $typeId;



    /**
     * Get typeId
     *
     * @return integer
     */
    public function getTypeId()
    {
        return $this->typeId;
    }
}
