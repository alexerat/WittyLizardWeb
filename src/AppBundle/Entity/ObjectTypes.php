<?php

namespace AppBundle\Entity;

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
     * @var \AppBundle\Entity\ObjectTypes
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\ObjectTypes")
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
     * @param \AppBundle\Entity\ObjectTypes $parent
     *
     * @return ObjectTypes
     */
    public function setParent(\AppBundle\Entity\ObjectTypes $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * Get parent
     *
     * @return \AppBundle\Entity\ObjectTypes
     */
    public function getParent()
    {
        return $this->parent;
    }
}
