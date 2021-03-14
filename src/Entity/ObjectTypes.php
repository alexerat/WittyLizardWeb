<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ObjectTypes
 *
 * @ORM\Table(name="Aux_Data.Object_Types", uniqueConstraints={@ORM\UniqueConstraint(name="Object_ID_UNIQUE", columns={"Type_ID"})}, indexes={@ORM\Index(name="fk_Object_Types_Object_Types1_idx", columns={"Parent_ID"})})
 * @ORM\Entity
 */
class ObjectTypes
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
     * @var \App\Entity\ObjectTypes
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\ObjectTypes")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Parent_ID", referencedColumnName="Type_ID")
     * })
     */
    private $parent;



    /**
     * Get typeId
     *
     * @return integer
     */
    public function getTypeId()
    {
        return $this->typeId;
    }

    /**
     * Set parent
     *
     * @param \App\Entity\ObjectTypes $parent
     *
     * @return ObjectTypes
     */
    public function setParent(\App\Entity\ObjectTypes $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * Get parent
     *
     * @return \App\Entity\ObjectTypes
     */
    public function getParent()
    {
        return $this->parent;
    }
}
